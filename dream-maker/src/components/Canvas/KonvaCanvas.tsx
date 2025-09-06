import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer, Image, RegularPolygon, Star } from 'react-konva';
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
          startX: pos.x, // Store the starting point for proper calculation
          startY: pos.y, // Store the starting point for proper calculation
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

      case 'triangle':
        const triangleId = generateId();
        const newTriangle = {
          id: triangleId,
          type: 'triangle',
          x: pos.x,
          y: pos.y,
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
        
      case 'star':
        const starId = generateId();
        const newStar = {
          id: starId,
          type: 'star',
          x: pos.x,
          y: pos.y,
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
        
      case 'pentagon':
        const pentagonId = generateId();
        const newPentagon = {
          id: pentagonId,
          type: 'pentagon',
          x: pos.x,
          y: pos.y,
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
        
      case 'hexagon':
        const hexagonId = generateId();
        const newHexagon = {
          id: hexagonId,
          type: 'hexagon',
          x: pos.x,
          y: pos.y,
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
        
      case 'octagon':
        const octagonId = generateId();
        const newOctagon = {
          id: octagonId,
          type: 'octagon',
          x: pos.x,
          y: pos.y,
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
    
    if (activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'triangle' || activeTool === 'star' || activeTool === 'pentagon' || activeTool === 'hexagon' || activeTool === 'octagon') {
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
        // Get the starting point from the shape properties
        const startX = lastShape.startX || lastShape.x;
        const startY = lastShape.startY || lastShape.y;
        
        // Calculate width and height
        const width = Math.abs(pos.x - startX);
        const height = Math.abs(pos.y - startY);
        
        const updatedShape = {
          ...lastShape,
          radiusX: width / 2,
          radiusY: height / 2,
          x: startX + (pos.x - startX) / 2, // Center X
          y: startY + (pos.y - startY) / 2  // Center Y
        };
        setShapes([...shapes.slice(0, -1), updatedShape]);
      } else if (activeTool === 'triangle' || activeTool === 'pentagon' || activeTool === 'hexagon' || activeTool === 'octagon') {
        // For regular polygons, calculate radius based on distance from start point to mouse
        const distance = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
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
        const distance = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
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
              const { startX, startY, ...cleanedShape } = shape;
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