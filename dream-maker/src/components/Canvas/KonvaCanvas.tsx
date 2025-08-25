import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useTheme } from '../../hooks/useTheme';
import { useDesignStore } from '../../store/designStore';

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
    setCanvasPosition
  } = useDesignStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
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
        const newRect = {
          id: generateId(),
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
        break;
        
      case 'ellipse':
        const newEllipse = {
          id: generateId(),
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
          const newText = {
            id: generateId(),
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
        }
        break;
        
      case 'eraser':
        // Find and remove shape at this position
        const shape = stage.getIntersection(pos);
        if (shape && shape.id()) {
          setShapes(shapes.filter(s => s.id !== shape.id()));
        }
        break;
    }
  }, [activeTool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, shapes, onSelectionChange, canvasScale, canvasX, canvasY, setCanvasScale, setCanvasPosition]);
  
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
      const newLine = {
        id: generateId(),
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
    }
    
    // Make shapes draggable after creation when in select mode
    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      const updatedShapes = shapes.map((shape, index) => {
        if (index === shapes.length - 1) {
          return { ...shape, draggable: true };
        }
        return shape;
      });
      setShapes(updatedShapes);
    }
  }, [isDrawing, activeTool, currentPath, shapes, strokeColor, fillColor, strokeWidth, isPanning]);
  
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
  
  // Render shape based on type
  const renderShape = (shape: any) => {
    const commonProps = {
      key: shape.id,
      id: shape.id,
      onClick: (e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
      onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(e, shape.id),
      draggable: activeTool === 'select' && shape.draggable
    };
    
    switch (shape.type) {
      case 'rect':
        return <Rect {...commonProps} {...shape} />;
      case 'ellipse':
        return <Ellipse {...commonProps} {...shape} />;
      case 'line':
        return <Line {...commonProps} {...shape} />;
      case 'text':
        return <Text {...commonProps} {...shape} />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="flex-1 overflow-hidden relative"
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth - 250} // Adjust based on toolbar width
        height={window.innerHeight - 100} // Adjust based on menu/status bar
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
          {/* Render all shapes */}
          {shapes.map(renderShape)}
          
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