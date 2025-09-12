import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer, Image, RegularPolygon, Star, Circle } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useTheme } from '../../hooks/useTheme';
import { useDesignStore } from '../../store/designStore';
import { useDrawHistory } from '../../hooks/useDrawHistory';
import { PersistenceService, type CanvasState } from '../../services/PersistenceService';
import { CropConfirmDialog } from '../Modals/CropConfirmDialog';
import { TextEditor } from './TextEditor';

interface ShapeObject {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  startX?: number;
  startY?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  align?: string;
  lineHeight?: number;
  letterSpacing?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  draggable?: boolean;
  padding?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  points?: number[];
  sides?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface KonvaCanvasProps {
  activeTool: string;
  fillColor: string;
  strokeColor: string;
  onSelectionChange?: (items: ShapeObject[]) => void;
}

export function KonvaCanvas({ activeTool, fillColor, strokeColor, onSelectionChange }: KonvaCanvasProps) {
  const { theme } = useTheme();
  const {
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textAlign,
    lineHeight,
    letterSpacing,
    textShadowColor,
    textShadowBlur,
    textShadowOffsetX,
    textShadowOffsetY,
    textShadowOpacity,
    strokeWidth,
    canvasScale,
    canvasX,
    canvasY,
    setCanvasScale,
    setCanvasPosition,
    objects
  } = useDesignStore();
  const { addAction } = useDrawHistory();
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const [shapes, setShapes] = useState<ShapeObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  
  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextNode, setEditingTextNode] = useState<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropRect, setCropRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStartPoint, setCropStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [draggedHandle, setDraggedHandle] = useState<string | null>(null);
  const [showCropConfirm, setShowCropConfirm] = useState(false);
  const [pendingCropData, setPendingCropData] = useState<{
    keptShapes: any[];
    removedShapes: any[];
    cropBounds: any;
  } | null>(null);
  
  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Get current canvas state for persistence
  const getCurrentState = useCallback((): CanvasState => ({
    shapes,
    objects,
    canvasScale,
    canvasX,
    canvasY,
    timestamp: Date.now()
  }), [shapes, objects, canvasScale, canvasX, canvasY]);

  // Load saved state on component mount
  useEffect(() => {
    const savedState = PersistenceService.loadState();
    if (savedState && window.confirm('A previous session was found. Would you like to restore it?')) {
      // Restore shapes
      setShapes(savedState.shapes || []);
      
      // Restore canvas position and scale
      setCanvasScale(savedState.canvasScale || 1);
      setCanvasPosition(savedState.canvasX || 0, savedState.canvasY || 0);
      
      console.log('Canvas state restored from previous session');
    }
  }, [setCanvasScale, setCanvasPosition]);

  // Start auto-save when component mounts
  useEffect(() => {
    PersistenceService.startAutoSave(getCurrentState);
    
    return () => {
      PersistenceService.stopAutoSave();
    };
  }, [getCurrentState]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      PersistenceService.manualSave(getCurrentState);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getCurrentState]);

  // Save state when shapes or canvas properties change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      PersistenceService.manualSave(getCurrentState);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [shapes, canvasScale, canvasX, canvasY, getCurrentState]);
  
  // Helper to transform pointer position
  const getTransformedPointer = (pos: {x: number, y: number}) => ({
    x: (pos.x - canvasX) / canvasScale,
    y: (pos.y - canvasY) / canvasScale
  });

  // Handle crop handle mouse down
  const handleCropHandleMouseDown = useCallback((handleId: string) => {
    setDraggedHandle(handleId);
  }, []);

  // Handle crop handle mouse move
  const handleCropHandleMouseMove = useCallback((pos: { x: number; y: number }) => {
    if (!cropRect || !draggedHandle) return;
    const tpos = getTransformedPointer(pos);
    const newRect = { ...cropRect };

    switch (draggedHandle) {
      case 'top-left':
        newRect.x = tpos.x;
        newRect.y = tpos.y;
        newRect.width = cropRect.x + cropRect.width - tpos.x;
        newRect.height = cropRect.y + cropRect.height - tpos.y;
        break;
      case 'top-right':
        newRect.y = tpos.y;
        newRect.width = tpos.x - cropRect.x;
        newRect.height = cropRect.y + cropRect.height - tpos.y;
        break;
      case 'bottom-left':
        newRect.x = tpos.x;
        newRect.width = cropRect.x + cropRect.width - tpos.x;
        newRect.height = tpos.y - cropRect.y;
        break;
      case 'bottom-right':
        newRect.width = tpos.x - cropRect.x;
        newRect.height = tpos.y - cropRect.y;
        break;
      case 'top':
        newRect.y = tpos.y;
        newRect.height = cropRect.y + cropRect.height - tpos.y;
        break;
      case 'bottom':
        newRect.height = tpos.y - cropRect.y;
        break;
      case 'left':
        newRect.x = tpos.x;
        newRect.width = cropRect.x + cropRect.width - tpos.x;
        break;
      case 'right':
        newRect.width = tpos.x - cropRect.x;
        break;
    }

    // Ensure minimum size
    if (newRect.width < 10) newRect.width = 10;
    if (newRect.height < 10) newRect.height = 10;

    setCropRect(newRect);
  }, [cropRect, draggedHandle]);

  // Handle crop handle mouse up
  const handleCropHandleMouseUp = useCallback(() => {
    setDraggedHandle(null);
  }, []);
  
  // Render crop handles
  const renderCropHandles = () => {
    if (!cropRect || activeTool !== 'crop') return null;

    const handles = [
      { id: 'top-left', x: cropRect.x, y: cropRect.y },
      { id: 'top-right', x: cropRect.x + cropRect.width, y: cropRect.y },
      { id: 'bottom-left', x: cropRect.x, y: cropRect.y + cropRect.height },
      { id: 'bottom-right', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
      { id: 'top', x: cropRect.x + cropRect.width / 2, y: cropRect.y },
      { id: 'bottom', x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height },
      { id: 'left', x: cropRect.x, y: cropRect.y + cropRect.height / 2 },
      { id: 'right', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2 },
    ];

    return handles.map(handle => (
      <Circle
        key={handle.id}
        x={handle.x}
        y={handle.y}
        radius={6}
        fill="#0066ff"
        stroke="#ffffff"
        strokeWidth={2}
        onMouseDown={() => {
          // Don't cancel bubble for mouse down - let Stage handle it too
          handleCropHandleMouseDown(handle.id);
        }}
        onMouseMove={(e: KonvaEventObject<MouseEvent>) => {
          if (draggedHandle === handle.id) {
            const stage = e.target.getStage();
            if (stage) {
              const pos = stage.getPointerPosition();
              if (pos) {
                handleCropHandleMouseMove(pos);
              }
            }
          }
        }}
        onMouseUp={() => {
          // Don't cancel bubble for mouse up - let Stage handle it too
          handleCropHandleMouseUp();
        }}
        style={{ cursor: getHandleCursor(handle.id) }}
      />
    ));
  };

  // Get cursor for crop handles
  const getHandleCursor = (handleId: string): string => {
    switch (handleId) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      case 'top':
      case 'bottom':
        return 'ns-resize';
      case 'left':
      case 'right':
        return 'ew-resize';
      default:
        return 'pointer';
    }
  };

  // Update canvas size when container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    // Initial size
    updateCanvasSize();
    
    // Listen for window resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Use ResizeObserver if available for more precise container size tracking
    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);
  
  // Load images when objects change
  useEffect(() => {
    const imageObjects = Object.values(objects).filter(obj => obj.type === 'image' && obj.imageData);
    
    imageObjects.forEach(obj => {
      if (!obj.imageData || loadedImages.has(obj.id)) return;
      
      const img = new window.Image();
      img.onload = () => {
        setLoadedImages(prev => {
          const newMap = new Map(prev);
          newMap.set(obj.id, img);
          return newMap;
        });
      };
      img.src = obj.imageData;
    });
  }, [objects, loadedImages]);
  
  // Handle drag and drop for images
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    // Import the first image file (could be extended to handle multiple)
    try {
      const { importImage } = useDesignStore.getState();
      const imageId = await importImage(imageFiles[0]);
      addAction('import_image', [imageId], { filename: imageFiles[0].name });
    } catch (error) {
      console.error('Failed to import dropped image:', error);
    }
  }, [addAction]);
  
  // Get cursor based on tool and state
  const getCursorForTool = (tool: string): string => {
    if (isPanning) return 'grabbing';
    
    switch (tool) {
      case 'select': return 'default';
      case 'hand': return 'grab';
      case 'text': return 'text';
      case 'crop': return 'crosshair';
      case 'eyedropper': return 'crosshair';
      case 'zoom': return 'zoom-in';
      case 'pen':
      case 'brush':
      case 'eraser': return 'crosshair';
      default: return 'crosshair';
    }
  };

  // Handle wheel zoom
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = canvasScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - canvasX) / oldScale,
      y: (pointer.y - canvasY) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setCanvasScale(clampedScale);
    setCanvasPosition(
      pointer.x - mousePointTo.x * clampedScale,
      pointer.y - mousePointTo.y * clampedScale
    );
  }, [canvasScale, canvasX, canvasY, setCanvasScale, setCanvasPosition]);
  
  // Handle stage mouse down
  const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    const tpos = getTransformedPointer(pos);
    
    // Check if we clicked on empty area
    const clickedOnEmpty = e.target === stage;
    
    // Handle panning with hand tool or space + drag
    if (activeTool === 'hand' || (activeTool !== 'hand' && e.evt.button === 1)) {
      setIsPanning(true);
      setLastPanPoint({ x: pos.x, y: pos.y });
      return;
    }
    
    // Handle zoom tool
    if (activeTool === 'zoom') {
      const oldScale = canvasScale;
      const mousePointTo = {
        x: (pos.x - canvasX) / oldScale,
        y: (pos.y - canvasY) / oldScale,
      };

      const scaleBy = 1.2;
      const newScale = e.evt.shiftKey ? oldScale / scaleBy : oldScale * scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      setCanvasScale(clampedScale);
      setCanvasPosition(
        pos.x - mousePointTo.x * clampedScale,
        pos.y - mousePointTo.y * clampedScale
      );
      return;
    }
    
    if (activeTool === 'select') {
      if (clickedOnEmpty) {
        setSelectedId(null);
        if (onSelectionChange) onSelectionChange([]);
      }
      return;
    }
    
    // Handle crop tool
    if (activeTool === 'crop') {
      if (clickedOnEmpty) {
        // Start crop selection
        setCropStartPoint({ x: tpos.x, y: tpos.y });
        setCropRect({
          x: tpos.x,
          y: tpos.y,
          width: 0,
          height: 0
        });
        setIsCropping(true);
      }
      return;
    }
    
    // Start drawing based on active tool
    switch (activeTool) {
      case 'rectangle': {
        const rectId = generateId();
        const newRect = {
          id: rectId,
          type: 'rect',
          x: tpos.x,
          y: tpos.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newRect]);
        setIsDrawing(true);
        // Note: We'll add the history action when the drawing is completed
        break;
      }
        
      case 'ellipse': {
        const ellipseId = generateId();
        const newEllipse = {
          id: ellipseId,
          type: 'ellipse',
          x: tpos.x,
          y: tpos.y,
          radiusX: 0,
          radiusY: 0,
          startX: tpos.x, // Store the starting point for proper calculation
          startY: tpos.y, // Store the starting point for proper calculation
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newEllipse]);
        setIsDrawing(true);
        // Note: We'll add the history action when the drawing is completed
        break;
      }
        
      case 'line':
        setCurrentPath([tpos.x, tpos.y, tpos.x, tpos.y]);
        setIsDrawing(true);
        break;
        
      case 'pen':
      case 'brush':
        setCurrentPath([tpos.x, tpos.y]);
        setIsDrawing(true);
        break;
        
      case 'text': {
        const textId = generateId();
        const newText = {
          id: textId,
          type: 'text',
          x: tpos.x,
          y: tpos.y,
          text: 'Double-click to edit',
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textDecoration: textDecoration,
          align: textAlign,
          lineHeight: lineHeight,
          letterSpacing: letterSpacing,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth > 0 ? strokeWidth * 0.5 : 0,
          width: Math.max(200, fontSize * 10), // Minimum width for editing
          padding: 4,
          draggable: false,
          // Text shadow properties
          shadowColor: textShadowBlur > 0 ? textShadowColor : '',
          shadowBlur: textShadowBlur,
          shadowOffsetX: textShadowOffsetX,
          shadowOffsetY: textShadowOffsetY,
          shadowOpacity: textShadowOpacity
        };
        setShapes([...shapes, newText]);
        
        // Immediately start editing the new text
        setTimeout(() => {
          const textNode = layerRef.current?.findOne(`#${textId}`);
          if (textNode) {
            setEditingTextId(textId);
            setEditingTextNode(textNode);
          }
        }, 50);
        
        addAction('create_text', [textId], { text: 'Double-click to edit', position: { x: tpos.x, y: tpos.y } });
        break;
      }
        
      case 'eraser': {
        // Find and remove shape at this position
        const shape = stage.getIntersection(pos);
        if (shape && shape.id()) {
          const shapeId = shape.id();
          setShapes(shapes.filter(s => s.id !== shapeId));
          addAction('delete_object', [shapeId], { position: { x: tpos.x, y: tpos.y } });
        }
        break;
      }

      case 'triangle': {
        const triangleId = generateId();
        const newTriangle = {
          id: triangleId,
          type: 'triangle',
          x: tpos.x,
          y: tpos.y,
          radius: 5, // Start with minimum visible radius
          sides: 3,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newTriangle]);
        setIsDrawing(true);
        break;
      }
        
      case 'star': {
        const starId = generateId();
        const newStar = {
          id: starId,
          type: 'star',
          x: tpos.x,
          y: tpos.y,
          innerRadius: 4, // Start with minimum visible inner radius
          outerRadius: 10, // Start with minimum visible outer radius
          numPoints: 5,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newStar]);
        setIsDrawing(true);
        break;
      }
        
      case 'pentagon': {
        const pentagonId = generateId();
        const newPentagon = {
          id: pentagonId,
          type: 'pentagon',
          x: tpos.x,
          y: tpos.y,
          radius: 5, // Start with minimum visible radius
          sides: 5,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newPentagon]);
        setIsDrawing(true);
        break;
      }
        
      case 'hexagon': {
        const hexagonId = generateId();
        const newHexagon = {
          id: hexagonId,
          type: 'hexagon',
          x: tpos.x,
          y: tpos.y,
          radius: 5, // Start with minimum visible radius
          sides: 6,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newHexagon]);
        setIsDrawing(true);
        break;
      }
        
      case 'octagon': {
        const octagonId = generateId();
        const newOctagon = {
          id: octagonId,
          type: 'octagon',
          x: tpos.x,
          y: tpos.y,
          radius: 5, // Start with minimum visible radius
          sides: 8,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newOctagon]);
        setIsDrawing(true);
        break;
      }
    }
  }, [activeTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, fontWeight, fontStyle, textDecoration, textAlign, lineHeight, letterSpacing, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY, textShadowOpacity, shapes, onSelectionChange, canvasScale, canvasX, canvasY, setCanvasScale, setCanvasPosition, addAction]);
  
  // Handle stage mouse move
  const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const tpos = getTransformedPointer(pos);

    // Handle panning
    if (isPanning) {
      const dx = pos.x - lastPanPoint.x;
      const dy = pos.y - lastPanPoint.y;
      setCanvasPosition(canvasX + dx, canvasY + dy);
      setLastPanPoint({ x: pos.x, y: pos.y });
      return;
    }

    // Handle crop handle dragging
    if (activeTool === 'crop' && draggedHandle) {
      handleCropHandleMouseMove(pos);
      return;
    }
    
    // Handle crop tool
    if (activeTool === 'crop' && isCropping && cropStartPoint) {
      const width = tpos.x - cropStartPoint.x;
      const height = tpos.y - cropStartPoint.y;
      
      // Ensure positive dimensions by adjusting x, y if necessary
      const rectX = width < 0 ? tpos.x : cropStartPoint.x;
      const rectY = height < 0 ? tpos.y : cropStartPoint.y;
      const rectWidth = Math.abs(width);
      const rectHeight = Math.abs(height);
      
      setCropRect({
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight
      });
      return;
    }
    
    if (!isDrawing) return;
    
    if (activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'triangle' || activeTool === 'star' || activeTool === 'pentagon' || activeTool === 'hexagon' || activeTool === 'octagon') {
      const lastShape = shapes[shapes.length - 1];
      if (!lastShape) return;
      
      const startX = lastShape.x || 0;
      const startY = lastShape.y || 0;
      
      if (activeTool === 'rectangle') {
        const updatedShape = {
          ...lastShape,
          width: tpos.x - startX,
          height: tpos.y - startY
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      } else if (activeTool === 'ellipse') {
        // Get the starting point from the shape properties
        const startX = lastShape.startX || lastShape.x || 0;
        const startY = lastShape.startY || lastShape.y || 0;
        
        // Calculate width and height
        const width = Math.abs(tpos.x - startX);
        const height = Math.abs(tpos.y - startY);
        
        const updatedShape = {
          ...lastShape,
          radiusX: width / 2,
          radiusY: height / 2,
          x: startX + (tpos.x - startX) / 2, // Center X
          y: startY + (tpos.y - startY) / 2  // Center Y
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      } else if (activeTool === 'triangle' || activeTool === 'pentagon' || activeTool === 'hexagon' || activeTool === 'octagon') {
        // For regular polygons, calculate radius based on distance from start point to mouse
        const distance = Math.sqrt(Math.pow(tpos.x - (startX || 0), 2) + Math.pow(tpos.y - (startY || 0), 2));
        const radius = Math.max(distance, 5); // Minimum radius of 5 pixels for visibility
        const updatedShape = {
          ...lastShape,
          radius: radius,
          x: startX, // Keep center at start point
          y: startY  // Keep center at start point
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      } else if (activeTool === 'star') {
        // For star, calculate both inner and outer radius
        const distance = Math.sqrt(Math.pow(tpos.x - (startX || 0), 2) + Math.pow(tpos.y - (startY || 0), 2));
        const outerRadius = Math.max(distance, 10); // Minimum outer radius of 10 pixels
        const innerRadius = Math.max(outerRadius * 0.4, 4); // Inner radius is 40% of outer, minimum 4 pixels
        const updatedShape = {
          ...lastShape,
          innerRadius: innerRadius,
          outerRadius: outerRadius,
          x: startX, // Keep center at start point
          y: startY  // Keep center at start point
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      }
    } else if (activeTool === 'line') {
      setCurrentPath([currentPath[0], currentPath[1], tpos.x, tpos.y]);
    } else if (activeTool === 'pen' || activeTool === 'brush') {
      setCurrentPath([...currentPath, tpos.x, tpos.y]);
    } else if (activeTool === 'eraser') {
      const shape = stage.getIntersection(pos);
      if (shape && shape.id()) {
        setShapes(shapes.filter(s => s.id !== shape.id()));
      }
    }
  }, [isDrawing, activeTool, shapes, currentPath, isPanning, lastPanPoint, canvasX, canvasY, setCanvasPosition, handleCropHandleMouseMove, draggedHandle, isCropping, cropStartPoint]);
  
  // Handle stage mouse up
  const handleStageMouseUp = useCallback(() => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Handle crop handle release
    if (draggedHandle) {
      handleCropHandleMouseUp();
      return;
    }
    
    // Handle crop tool completion
    if (activeTool === 'crop' && isCropping) {
      setIsCropping(false);
      // Crop rectangle is now ready - user can press Enter to apply or Escape to cancel
      return;
    }
    
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if ((activeTool === 'line' || activeTool === 'pen' || activeTool === 'brush') && currentPath.length > 0) {
      const lineId = generateId();
      const newLine = {
        id: lineId,
        type: 'line',
        points: currentPath,
        stroke: activeTool === 'brush' ? fillColor : strokeColor,
        strokeWidth: activeTool === 'brush' ? strokeWidth * 4 : strokeWidth,
        tension: activeTool === 'pen' || activeTool === 'brush' ? 0.5 : 0,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false
      };
      setShapes([...shapes, newLine]);
      setCurrentPath([]);
      
      // Add to history
      if (activeTool === 'line') {
        addAction('create_line', [lineId], { points: currentPath });
      } else if (activeTool === 'pen') {
        addAction('create_pen_stroke', [lineId], { points: currentPath });
      } else if (activeTool === 'brush') {
        addAction('create_brush_stroke', [lineId], { points: currentPath });
      }
    }
    
    // Make shapes draggable after creation when in select mode and add to history
    if (activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'triangle' || activeTool === 'star' || activeTool === 'pentagon' || activeTool === 'hexagon' || activeTool === 'octagon') {
      const lastShapeIndex = shapes.length - 1;
      const lastShape = shapes[lastShapeIndex];
      
      if (lastShape) {
        const updatedShapes = shapes.map((shape, index) => {
          if (index === lastShapeIndex) {
            return { ...shape, draggable: true };
          }
          return shape;
        });
        setShapes(updatedShapes);
        
        // Add to history
        if (activeTool === 'rectangle') {
          addAction('create_rectangle', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            width: lastShape.width, 
            height: lastShape.height 
          });
        } else if (activeTool === 'ellipse') {
          addAction('create_ellipse', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            radiusX: lastShape.radiusX, 
            radiusY: lastShape.radiusY 
          });
          
          // Clean up temporary properties that aren't needed after creation
          const cleanedShapes = shapes.map(shape => {
            if (shape.id === lastShape.id) {
              const { startX: _startX, startY: _startY, ...cleanedShape } = shape;
              return cleanedShape;
            }
            return shape;
          });
          setShapes(cleanedShapes);
        } else if (activeTool === 'triangle') {
          addAction('create_triangle', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            radius: lastShape.radius,
            sides: lastShape.sides
          });
        } else if (activeTool === 'star') {
          addAction('create_star', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            innerRadius: lastShape.innerRadius,
            outerRadius: lastShape.outerRadius,
            numPoints: lastShape.numPoints
          });
        } else if (activeTool === 'pentagon') {
          addAction('create_pentagon', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            radius: lastShape.radius,
            sides: lastShape.sides
          });
        } else if (activeTool === 'hexagon') {
          addAction('create_hexagon', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            radius: lastShape.radius,
            sides: lastShape.sides
          });
        } else if (activeTool === 'octagon') {
          addAction('create_octagon', [lastShape.id], { 
            x: lastShape.x, 
            y: lastShape.y, 
            radius: lastShape.radius,
            sides: lastShape.sides
          });
        }
      }
    }
  }, [isDrawing, activeTool, currentPath, shapes, strokeColor, fillColor, strokeWidth, isPanning, addAction, draggedHandle, handleCropHandleMouseUp, isCropping]);
  
  // Handle shape click for selection
  const handleShapeClick = useCallback((e: KonvaEventObject<MouseEvent>, shapeId: string) => {
    if (activeTool === 'select') {
      e.cancelBubble = true;
      setSelectedId(shapeId);
      if (onSelectionChange) {
        const shape = shapes.find(s => s.id === shapeId);
        if (shape) onSelectionChange([shape]);
      }
    }
  }, [activeTool, shapes, onSelectionChange]);

  // Handle text double-click for editing
  const handleTextDoubleClick = useCallback((e: KonvaEventObject<MouseEvent>, shapeId: string) => {
    e.cancelBubble = true;
    const shape = shapes.find(s => s.id === shapeId && s.type === 'text');
    if (shape && activeTool === 'select') {
      setEditingTextId(shapeId);
      setEditingTextNode(e.target);
    }
  }, [shapes, activeTool]);

  // Handle text editing
  const handleTextChange = useCallback((newText: string) => {
    if (!editingTextId) return;
    
    setShapes(shapes.map(shape => 
      shape.id === editingTextId 
        ? { ...shape, text: newText }
        : shape
    ));
  }, [editingTextId, shapes]);

  const handleTextEditClose = useCallback(() => {
    if (editingTextId) {
      // Make the shape draggable after editing
      setShapes(shapes.map(shape => 
        shape.id === editingTextId 
          ? { ...shape, draggable: true }
          : shape
      ));
      
      addAction('edit_text', [editingTextId], { 
        text: shapes.find(s => s.id === editingTextId)?.text 
      });
    }
    
    setEditingTextId(null);
    setEditingTextNode(null);
  }, [editingTextId, shapes, addAction]);
  
  // Handle transformer updates
  const handleTransformEnd = useCallback((e: KonvaEventObject<Event>, shapeId: string) => {
    const node = e.target;
    const updatedShapes = shapes.map(shape => {
      if (shape.id === shapeId) {
        return {
          ...shape,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY()
        };
      }
      return shape;
    });
    setShapes(updatedShapes);
  }, [shapes]);
  
  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);
  
  // Handle keyboard events for crop tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool === 'crop' && cropRect) {
        if (e.key === 'Enter') {
          // Apply crop
          applyCrop();
        } else if (e.key === 'Escape') {
          // Cancel crop
          cancelCrop();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, cropRect]);
  
  // Apply crop function
  const applyCrop = useCallback(() => {
    if (!cropRect) return;
    
    // Calculate crop bounds
    const cropBounds = {
      x: Math.min(cropRect.x, cropRect.x + cropRect.width),
      y: Math.min(cropRect.y, cropRect.y + cropRect.height),
      width: Math.abs(cropRect.width),
      height: Math.abs(cropRect.height)
    };
    
    // Calculate which shapes will be kept vs removed
    const keptShapes = shapes.filter(shape => {
      let shapeBounds: { x: number; y: number; width: number; height: number } | null = null;
      
      switch (shape.type) {
        case 'rect':
          shapeBounds = {
            x: shape.x || 0,
            y: shape.y || 0,
            width: shape.width || 0,
            height: shape.height || 0
          };
          break;
        case 'ellipse':
          shapeBounds = {
            x: (shape.x || 0) - (shape.radiusX || 0),
            y: (shape.y || 0) - (shape.radiusY || 0),
            width: (shape.radiusX || 0) * 2,
            height: (shape.radiusY || 0) * 2
          };
          break;
        case 'triangle':
        case 'pentagon':
        case 'hexagon':
        case 'octagon':
          shapeBounds = {
            x: (shape.x || 0) - (shape.radius || 0),
            y: (shape.y || 0) - (shape.radius || 0),
            width: (shape.radius || 0) * 2,
            height: (shape.radius || 0) * 2
          };
          break;
        case 'star':
          shapeBounds = {
            x: (shape.x || 0) - (shape.outerRadius || 0),
            y: (shape.y || 0) - (shape.outerRadius || 0),
            width: (shape.outerRadius || 0) * 2,
            height: (shape.outerRadius || 0) * 2
          };
          break;
        case 'line':
          if (shape.points && shape.points.length >= 4) {
            const points = shape.points as number[];
            const xCoords = points.filter((_, i) => i % 2 === 0);
            const yCoords = points.filter((_, i) => i % 2 === 1);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            shapeBounds = {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
            };
          }
          break;
        case 'text': {
          // Approximate text bounds (this could be improved with actual text measurement)
          const textWidth = (shape.text || '').length * (shape.fontSize || 16) * 0.6;
          const textHeight = shape.fontSize || 16;
          shapeBounds = {
            x: shape.x || 0,
            y: shape.y || 0,
            width: textWidth,
            height: textHeight
          };
          break;
        }
        case 'image': {
          shapeBounds = {
            x: shape.x || 0,
            y: shape.y || 0,
            width: shape.width || 0,
            height: shape.height || 0
          };
          break;
        }
      }
      
      if (shapeBounds) {
        // Check if shape intersects with crop area
        const intersects = !(
          shapeBounds.x + shapeBounds.width < cropBounds.x ||
          shapeBounds.x > cropBounds.x + cropBounds.width ||
          shapeBounds.y + shapeBounds.height < cropBounds.y ||
          shapeBounds.y > cropBounds.y + cropBounds.height
        );
        
        return intersects;
      }
      
      return false; // Remove shapes we can't determine bounds for
    });
    
    const removedShapes = shapes.filter(shape => !keptShapes.includes(shape));
    
    // Always show confirmation dialog before cropping
    setPendingCropData({ keptShapes, removedShapes, cropBounds });
    setShowCropConfirm(true);
  }, [cropRect, shapes]);

  // Perform the actual crop operation
  const performCrop = useCallback((keptShapes: any[], removedShapes: any[], cropBounds: any) => {
    // Transform kept shapes to adjust for new canvas origin
    const transformedShapes = keptShapes.map(shape => {
      const transformedShape = { ...shape };
      
      // Adjust position based on crop bounds
      if (shape.x !== undefined) {
        transformedShape.x = shape.x - cropBounds.x;
      }
      if (shape.y !== undefined) {
        transformedShape.y = shape.y - cropBounds.y;
      }
      
      // Handle line points
      if (shape.type === 'line' && shape.points) {
        transformedShape.points = shape.points.map((point: number, index: number) => {
          if (index % 2 === 0) {
            // X coordinate
            return point - cropBounds.x;
          } else {
            // Y coordinate
            return point - cropBounds.y;
          }
        });
      }
      
      return transformedShape;
    });
    
    setShapes(transformedShapes);
    
    // Transform objects in the design store as well
    const { removeObject, updateObject } = useDesignStore.getState();
    
    // Remove objects outside crop bounds
    removedShapes.forEach(shape => removeObject(shape.id));
    
    // Transform remaining objects
    transformedShapes.forEach(shape => {
      if (objects[shape.id]) {
        updateObject(shape.id, {
          ...objects[shape.id],
          x: shape.x,
          y: shape.y,
          ...(shape.points && { points: shape.points })
        });
      }
    });
    
    // Calculate optimal scale to fit the cropped content in the viewport
    const cropWidth = Math.abs(cropBounds.width);
    const cropHeight = Math.abs(cropBounds.height);
    
    // Leave some padding around the cropped content
    const padding = 50;
    const viewportWidth = canvasSize.width - padding * 2;
    const viewportHeight = canvasSize.height - padding * 2;
    
    // Calculate scale to fit the cropped area in the viewport
    const scaleX = viewportWidth / cropWidth;
    const scaleY = viewportHeight / cropHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
    
    // Center the cropped content in the viewport
    const centerX = (canvasSize.width - cropWidth * optimalScale) / 2;
    const centerY = (canvasSize.height - cropHeight * optimalScale) / 2;
    
    // Apply the calculated scale and position
    setCanvasScale(optimalScale);
    setCanvasPosition(centerX, centerY);
    
    // Add to history
    addAction('crop_canvas', [], { 
      cropBounds,
      removedObjects: removedShapes.map(s => s.id),
      newCanvasScale: optimalScale,
      newCanvasPosition: { x: centerX, y: centerY }
    });
    
    // Clear crop
    setCropRect(null);
    setCropStartPoint(null);
  }, [canvasScale, canvasSize, setCanvasPosition, setCanvasScale, addAction, objects]);

  // Handle crop confirmation
  const handleCropConfirm = useCallback(() => {
    if (pendingCropData) {
      performCrop(pendingCropData.keptShapes, pendingCropData.removedShapes, pendingCropData.cropBounds);
    }
    setShowCropConfirm(false);
    setPendingCropData(null);
  }, [pendingCropData, performCrop]);

  // Handle crop cancellation
  const handleCropCancel = useCallback(() => {
    setShowCropConfirm(false);
    setPendingCropData(null);
  }, []);
  
  // Cancel crop function
  const cancelCrop = useCallback(() => {
    setCropRect(null);
    setCropStartPoint(null);
    setIsCropping(false);
  }, []);
  
  // Clean up crop state when tool changes
  useEffect(() => {
    if (activeTool !== 'crop') {
      setCropRect(null);
      setCropStartPoint(null);
      setIsCropping(false);
    }
  }, [activeTool]);

  // Render object based on type
  const renderObject = (obj: any): React.ReactElement | null => {
    const commonProps = {
      key: obj.id,
      id: obj.id,
      onClick: (e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, obj.id),
      onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(e, obj.id),
      draggable: activeTool === 'select' && obj.draggable
    };
    
    switch (obj.type) {
      case 'shape':
        // Handle legacy shape objects
        if (obj.shapeType === 'rect') {
          return <Rect {...commonProps} {...obj} />;
        } else if (obj.shapeType === 'ellipse') {
          return <Ellipse {...commonProps} {...obj} />;
        }
        return null;
      case 'rect':
        return <Rect {...commonProps} {...obj} />;
      case 'ellipse':
        return <Ellipse {...commonProps} {...obj} />;
      case 'triangle':
        return (
          <RegularPolygon
            {...commonProps}
            x={obj.x}
            y={obj.y}
            sides={3}
            radius={Math.max(obj.radius || 5, 5)} // Ensure minimum radius
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth}
          />
        );
      case 'pentagon':
        return (
          <RegularPolygon
            {...commonProps}
            x={obj.x}
            y={obj.y}
            sides={5}
            radius={Math.max(obj.radius || 5, 5)} // Ensure minimum radius
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth}
          />
        );
      case 'hexagon':
        return (
          <RegularPolygon
            {...commonProps}
            x={obj.x}
            y={obj.y}
            sides={6}
            radius={Math.max(obj.radius || 5, 5)} // Ensure minimum radius
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth}
          />
        );
      case 'octagon':
        return (
          <RegularPolygon
            {...commonProps}
            x={obj.x}
            y={obj.y}
            sides={8}
            radius={Math.max(obj.radius || 5, 5)} // Ensure minimum radius
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth}
          />
        );
      case 'star':
        return (
          <Star
            {...commonProps}
            x={obj.x}
            y={obj.y}
            numPoints={obj.numPoints || 5}
            innerRadius={Math.max(obj.innerRadius || 4, 4)} // Ensure minimum inner radius
            outerRadius={Math.max(obj.outerRadius || 10, 10)} // Ensure minimum outer radius
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth}
          />
        );
      case 'line':
        return <Line {...commonProps} {...obj} />;
      case 'text':
        return (
          <Text 
            {...commonProps} 
            {...obj} 
            visible={editingTextId !== obj.id}
            onDblClick={(e: KonvaEventObject<MouseEvent>) => handleTextDoubleClick(e, obj.id)}
            onDblTap={(e: KonvaEventObject<MouseEvent>) => handleTextDoubleClick(e, obj.id)}
          />
        );
      case 'image': {
        const imageElement = loadedImages.get(obj.id);
        if (!imageElement) return null;
        
        // Calculate initial size (scale down large images to fit screen nicely)
        const maxSize = 300;
        const scale = Math.min(maxSize / obj.naturalWidth!, maxSize / obj.naturalHeight!, 1);
        const width = (obj.width || obj.naturalWidth! * scale);
        const height = (obj.height || obj.naturalHeight! * scale);
        
        return (
          <Image
            {...commonProps}
            image={imageElement}
            x={obj.x || 100}
            y={obj.y || 100}
            width={width}
            height={height}
          />
        );
      }
      default:
        return null;
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ backgroundColor: theme.colors.background.secondary }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={canvasScale}
        scaleY={canvasScale}
        x={canvasX}
        y={canvasY}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheel}
        style={{ cursor: getCursorForTool(activeTool) }}
      >
        <Layer ref={layerRef}>
          {/* Render all objects */}
          {Object.values(objects).filter(obj => obj.visible).map(renderObject)}
          
          {/* Render legacy shapes if any exist */}
          {shapes.map((shape) => renderObject(shape as any)).filter(Boolean)}
          
          {/* Render current drawing path */}
          {isDrawing && currentPath.length > 0 && (activeTool === 'line' || activeTool === 'pen' || activeTool === 'brush') && (
            <Line
              points={currentPath}
              stroke={activeTool === 'brush' ? fillColor : strokeColor}
              strokeWidth={activeTool === 'brush' ? strokeWidth * 4 : strokeWidth}
              tension={activeTool === 'pen' || activeTool === 'brush' ? 0.5 : 0}
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* Render crop rectangle */}
          {activeTool === 'crop' && cropRect && (
            <Rect
              x={cropRect.x}
              y={cropRect.y}
              width={cropRect.width}
              height={cropRect.height}
              fill="rgba(0, 102, 255, 0.3)"
              stroke="#0066ff"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}

          {/* Render crop handles */}
          {renderCropHandles()}
          
          {/* Transformer for selected shapes */}
          {activeTool === 'select' && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
      
      {/* Text editor overlay */}
      {editingTextId && editingTextNode && (
        <TextEditor
          textNode={editingTextNode as any}
          initialText={(shapes.find(s => s.id === editingTextId) as ShapeObject)?.text || ''}
          onChange={handleTextChange}
          onClose={handleTextEditClose}
        />
      )}
      
      {/* Crop confirmation dialog */}
      <CropConfirmDialog
        isOpen={showCropConfirm}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        objectCount={pendingCropData?.removedShapes.length || 0}
        keptObjectCount={pendingCropData?.keptShapes.length || 0}
        cropWidth={pendingCropData?.cropBounds.width || 0}
        cropHeight={pendingCropData?.cropBounds.height || 0}
      />
    </div>
  );
}