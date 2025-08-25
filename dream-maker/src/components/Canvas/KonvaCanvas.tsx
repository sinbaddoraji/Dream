import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer, Image } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useTheme } from '../../hooks/useTheme';
import { useDesignStore } from '../../store/designStore';
import { useDrawHistory } from '../../hooks/useDrawHistory';

interface KonvaCanvasProps {
  activeTool: string;
  fillColor: string;
  strokeColor: string;
  onSelectionChange?: (items: any[]) => void;
}

export function KonvaCanvas({ activeTool, fillColor, strokeColor, onSelectionChange }: KonvaCanvasProps) {
  const { theme } = useTheme();
  const {
    fontSize,
    fontFamily,
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
  
  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
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
    
    // Start drawing based on active tool
    switch (activeTool) {
      case 'rectangle':
        const rectId = generateId();
        const newRect = {
          id: rectId,
          type: 'rect',
          x: pos.x,
          y: pos.y,
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
        
      case 'ellipse':
        const ellipseId = generateId();
        const newEllipse = {
          id: ellipseId,
          type: 'ellipse',
          x: pos.x,
          y: pos.y,
          radiusX: 0,
          radiusY: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          draggable: false
        };
        setShapes([...shapes, newEllipse]);
        setIsDrawing(true);
        // Note: We'll add the history action when the drawing is completed
        break;
        
      case 'line':
        setCurrentPath([pos.x, pos.y, pos.x, pos.y]);
        setIsDrawing(true);
        break;
        
      case 'pen':
      case 'brush':
        setCurrentPath([pos.x, pos.y]);
        setIsDrawing(true);
        break;
        
      case 'text':
        const text = prompt('Enter text:', 'Text');
        if (text) {
          const textId = generateId();
          const newText = {
            id: textId,
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: text,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: fillColor,
            draggable: false
          };
          setShapes([...shapes, newText]);
          // Add to history immediately for text
          addAction('create_text', [textId], { text, position: { x: pos.x, y: pos.y } });
        }
        break;
        
      case 'eraser':
        // Find and remove shape at this position
        const shape = stage.getIntersection(pos);
        if (shape && shape.id()) {
          const shapeId = shape.id();
          setShapes(shapes.filter(s => s.id !== shapeId));
          addAction('delete_object', [shapeId], { position: { x: pos.x, y: pos.y } });
        }
        break;
    }
  }, [activeTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, shapes, onSelectionChange, canvasScale, canvasX, canvasY, setCanvasScale, setCanvasPosition, addAction]);
  
  // Handle stage mouse move
  const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Handle panning
    if (isPanning) {
      const dx = pos.x - lastPanPoint.x;
      const dy = pos.y - lastPanPoint.y;
      setCanvasPosition(canvasX + dx, canvasY + dy);
      setLastPanPoint({ x: pos.x, y: pos.y });
      return;
    }
    
    if (!isDrawing) return;
    
    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      const lastShape = shapes[shapes.length - 1];
      if (!lastShape) return;
      
      const startX = lastShape.x;
      const startY = lastShape.y;
      
      if (activeTool === 'rectangle') {
        const updatedShape = {
          ...lastShape,
          width: pos.x - startX,
          height: pos.y - startY
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      } else if (activeTool === 'ellipse') {
        const updatedShape = {
          ...lastShape,
          radiusX: Math.abs(pos.x - startX) / 2,
          radiusY: Math.abs(pos.y - startY) / 2,
          x: (startX + pos.x) / 2,
          y: (startY + pos.y) / 2
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      }
    } else if (activeTool === 'line') {
      setCurrentPath([currentPath[0], currentPath[1], pos.x, pos.y]);
    } else if (activeTool === 'pen' || activeTool === 'brush') {
      setCurrentPath([...currentPath, pos.x, pos.y]);
    } else if (activeTool === 'eraser') {
      const shape = stage.getIntersection(pos);
      if (shape && shape.id()) {
        setShapes(shapes.filter(s => s.id !== shape.id()));
      }
    }
  }, [isDrawing, activeTool, shapes, currentPath, isPanning, lastPanPoint, canvasX, canvasY, setCanvasPosition]);
  
  // Handle stage mouse up
  const handleStageMouseUp = useCallback(() => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
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
    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
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
        }
      }
    }
  }, [isDrawing, activeTool, currentPath, shapes, strokeColor, fillColor, strokeWidth, isPanning, addAction]);
  
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
  
  // Render object based on type
  const renderObject = (obj: any) => {
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
      case 'line':
        return <Line {...commonProps} {...obj} />;
      case 'text':
        return <Text {...commonProps} {...obj} />;
      case 'image':
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
          {shapes.map(renderObject)}
          
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
          
          {/* Transformer for selected shapes */}
          {activeTool === 'select' && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
    </div>
  );
}