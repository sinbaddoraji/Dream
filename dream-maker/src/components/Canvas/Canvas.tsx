import { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import { useTheme } from '../../hooks/useTheme';
import { useDesignStore } from '../../store/designStore';
import type { CanvasObject } from '../../store/designStore';
import { SelectionOverlay } from './SelectionOverlay';
import { selectionManager } from '../../utils/SelectionManager';

interface CanvasProps {
  activeTool: string;
  fillColor: string;
  strokeColor: string;
  onSelectionChange?: (items: paper.Item[]) => void;
}

export function Canvas({ activeTool, fillColor, strokeColor, onSelectionChange }: CanvasProps) {
  const { theme } = useTheme();
  const {
    objects,
    addObject,
    deleteObjects,
    selectObjects,
    addToSelection,
    clearSelection,
    selection,
    strokeWidth,
    setFillColor,
    setStrokeColor
  } = useDesignStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<paper.PaperScope | null>(null);
  const currentToolRef = useRef<paper.Tool | null>(null);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [, setLassoPath] = useState<paper.Path | null>(null);
  const [, setCropOverlay] = useState<paper.Path.Rectangle | null>(null);
  
  // Helper function to get cursor based on tool
  const getCursorForTool = (tool: string): string => {
    switch (tool) {
      case 'select': return 'default';
      case 'hand': return 'grab';
      case 'text': return 'text';
      case 'eyedropper': return 'crosshair';
      case 'zoom': return 'zoom-in';
      case 'crop': return 'crosshair';
      case 'eraser': return 'crosshair';
      case 'pen':
      case 'brush':
      case 'paintbrush': return 'crosshair';
      default: return 'crosshair';
    }
  };

  // Utility function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Utility function to create a canvas object
  const createCanvasObject = (paperItem: paper.Item, type: CanvasObject['type']): CanvasObject => {
    return {
      id: generateId(),
      paperItem,
      type,
      locked: false,
      visible: true,
      name: `${type} ${Object.keys(objects).length + 1}`
    };
  };

  useEffect(() => {
    if (canvasRef.current && !scopeRef.current) {
      scopeRef.current = new paper.PaperScope();
      scopeRef.current.setup(canvasRef.current);
      
      scopeRef.current.activate();
      
      // Set initial canvas size
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      
      // Wait for Paper.js to be fully initialized
      if (paper.view) {
        paper.view.onResize = () => {
          if (paper.view && canvasRef.current) {
            paper.view.viewSize = new paper.Size(
              canvasRef.current.offsetWidth,
              canvasRef.current.offsetHeight
            );
          }
        };
      }

      setupInitialView();
      
      // Handle canvas resize (both window resize and container changes)
      const handleResize = () => {
        if (canvas && paper.view) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          paper.view.viewSize = new paper.Size(canvas.width, canvas.height);
        }
      };
      
      // Listen for window resize
      window.addEventListener('resize', handleResize);
      
      // Use ResizeObserver to detect when the canvas container changes size
      let resizeObserver: ResizeObserver | undefined;
      if (canvas && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          // Small delay to ensure layout is complete
          setTimeout(handleResize, 10);
        });
        resizeObserver.observe(canvas);
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }
  }, []);

  const setupInitialView = () => {
    if (!scopeRef.current || !paper.view) return;
    
    scopeRef.current.activate();
    
    if (canvasRef.current) {
      paper.view.viewSize = new paper.Size(
        canvasRef.current.offsetWidth || 800,
        canvasRef.current.offsetHeight || 600
      );
    }
    
    paper.view.zoom = 1;
    paper.view.center = new paper.Point(0, 0);
  };

  useEffect(() => {
    if (!scopeRef.current || !paper.project) return;
    
    scopeRef.current.activate();
    
    if (currentToolRef.current) {
      currentToolRef.current.remove();
    }

    let tool: paper.Tool;

    switch (activeTool) {
      case 'select':
        tool = createSelectTool();
        break;
      case 'lasso':
        tool = createLassoTool();
        break;
      case 'magic-wand':
        tool = createMagicWandTool();
        break;
      case 'shapes':
      case 'rectangle':
        tool = createRectangleTool();
        break;
      case 'ellipse':
        tool = createEllipseTool();
        break;
      case 'triangle':
        tool = createTriangleTool();
        break;
      case 'star':
        tool = createStarTool();
        break;
      case 'hexagon':
        tool = createHexagonTool();
        break;
      case 'pentagon':
        tool = createPentagonTool();
        break;
      case 'octagon':
        tool = createOctagonTool();
        break;
      case 'line':
        tool = createLineTool();
        break;
      case 'pen':
        tool = createPenTool();
        break;
      case 'brush':
        tool = createBrushTool();
        break;
      case 'paintbrush':
        tool = createPaintbrushTool();
        break;
      case 'eraser':
        tool = createEraserTool();
        break;
      case 'text':
        tool = createTextTool();
        break;
      case 'crop':
        tool = createCropTool();
        break;
      case 'eyedropper':
        tool = createEyedropperTool();
        break;
      case 'zoom':
        tool = createZoomTool();
        break;
      case 'hand':
        tool = createHandTool();
        break;
      default:
        tool = createSelectTool();
    }

    currentToolRef.current = tool;
    tool.activate();
  }, [activeTool, fillColor, strokeColor, strokeWidth, objects, selection, addObject, deleteObjects, selectObjects, addToSelection, clearSelection, onSelectionChange, setFillColor, setStrokeColor]);

  const createSelectTool = () => {
    const tool = new paper.Tool();
    let hitItem: paper.Item | null = null;
    let hitObjectId: string | null = null;
    let selectionOutlines: paper.Path.Rectangle[] = [];
    
    // Function to update selection visuals
    const updateSelectionVisuals = () => {
      // Clear existing selection outlines
      selectionOutlines.forEach(outline => outline.remove());
      selectionOutlines = [];
      
      // Create outlines for selected objects
      selection.selectedIds.forEach(id => {
        const obj = objects[id];
        if (obj && obj.paperItem) {
          const outline = new paper.Path.Rectangle(obj.paperItem.bounds);
          outline.strokeColor = new paper.Color('#0066ff');
          outline.strokeWidth = 2;
          outline.dashArray = [5, 5];
          outline.selected = false;
          outline.locked = true; // Prevent the outline from being selected
          selectionOutlines.push(outline);
        }
      });
    };
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      // Check if we hit an existing object (with better tolerance)
      const hitResult = paper.project.hitTest(event.point, {
        fill: true,
        stroke: true,
        tolerance: 5,
        bounds: true
      });

      if (hitResult && hitResult.item && !hitResult.item.locked) {
        hitItem = hitResult.item;
        
        // Find the object ID for this paper item
        hitObjectId = Object.entries(objects).find(([, obj]) => obj.paperItem === hitResult.item)?.[0] || null;
        
        if (hitObjectId) {
          if (event.modifiers.shift) {
            // Add/remove from selection
            if (selection.selectedIds.includes(hitObjectId)) {
              // Remove from selection
              const newSelection = selection.selectedIds.filter(id => id !== hitObjectId);
              selectObjects(newSelection);
            } else {
              // Add to selection
              addToSelection([hitObjectId]);
            }
          } else {
            // Select only this object
            selectObjects([hitObjectId]);
          }
          
          // Update visual selection
          setTimeout(updateSelectionVisuals, 0);
        }
        
        // Legacy compatibility
        if (onSelectionChange) {
          onSelectionChange([hitResult.item]);
        }
      } else {
        // No hit - clear selection if not holding shift
        if (!event.modifiers.shift) {
          clearSelection();
          updateSelectionVisuals();
          if (onSelectionChange) {
            onSelectionChange([]);
          }
        }
        
        // Start marquee selection
        setIsMarqueeSelecting(true);
        selectionManager.startMarqueeSelection(event.point);
        hitItem = null;
        hitObjectId = null;
      }
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (hitItem && hitObjectId && !isMarqueeSelecting) {
        // Move selected objects
        const selectedObjects = Object.entries(objects)
          .filter(([id]) => selection.selectedIds.includes(id))
          .map(([, obj]) => obj);
        
        selectedObjects.forEach(obj => {
          obj.paperItem.position = obj.paperItem.position.add(event.delta);
        });
      } else if (isMarqueeSelecting) {
        // Update marquee selection
        selectionManager.updateMarqueeSelection(event.point);
      }
    };

    tool.onMouseUp = (event: paper.ToolEvent) => {
      if (isMarqueeSelecting) {
        // Complete marquee selection
        const selectedIds = selectionManager.endMarqueeSelection(objects);
        
        if (selectedIds.length > 0) {
          if (event.modifiers?.shift) {
            addToSelection(selectedIds);
          } else {
            selectObjects(selectedIds);
          }
          
          // Update visual selection
          setTimeout(updateSelectionVisuals, 0);
          
          // Legacy compatibility
          if (onSelectionChange) {
            const selectedItems = selectedIds.map(id => objects[id]?.paperItem).filter(Boolean);
            onSelectionChange(selectedItems);
          }
        }
        
        setIsMarqueeSelecting(false);
      }
      
      hitItem = null;
      hitObjectId = null;
    };
    
    // Add keyboard support for selection
    tool.onKeyDown = (event: paper.KeyEvent) => {
      // Select All (Ctrl/Cmd + A)
      if ((event.modifiers.command || event.modifiers.control) && event.key === 'a') {
        event.preventDefault();
        const allIds = Object.keys(objects);
        selectObjects(allIds);
        updateSelectionVisuals();
      }
      
      // Deselect All (Escape)
      if (event.key === 'escape') {
        clearSelection();
        updateSelectionVisuals();
      }
      
      // Delete selected items (Delete or Backspace)
      if (event.key === 'delete' || event.key === 'backspace') {
        if (selection.selectedIds.length > 0) {
          deleteObjects(selection.selectedIds);
          updateSelectionVisuals();
        }
      }
      
      // Group selected items (Ctrl/Cmd + G)
      if ((event.modifiers.command || event.modifiers.control) && event.key === 'g') {
        event.preventDefault();
        if (selection.selectedIds.length > 1) {
          // Create a group from selected items
          const group = new paper.Group();
          selection.selectedIds.forEach(id => {
            const obj = objects[id];
            if (obj && obj.paperItem) {
              group.addChild(obj.paperItem);
            }
          });
          
          // Create a new canvas object for the group
          const groupObject = createCanvasObject(group, 'group');
          addObject(groupObject);
          
          // Remove individual items from objects and select the group
          deleteObjects(selection.selectedIds);
          selectObjects([groupObject.id]);
          updateSelectionVisuals();
        }
      }
      
      // Ungroup selected items (Ctrl/Cmd + Shift + G)
      if ((event.modifiers.command || event.modifiers.control) && event.modifiers.shift && event.key === 'g') {
        event.preventDefault();
        const newIds: string[] = [];
        
        selection.selectedIds.forEach(id => {
          const obj = objects[id];
          if (obj && obj.type === 'group' && obj.paperItem instanceof paper.Group) {
            // Extract children from the group
            const children = [...obj.paperItem.children];
            children.forEach(child => {
              // Remove child from group (it will be added as standalone)
              child.remove();
              const newObject = createCanvasObject(child, 'shape');
              addObject(newObject);
              newIds.push(newObject.id);
            });
            
            // Remove the group
            deleteObjects([id]);
          }
        });
        
        // Select the ungrouped items
        if (newIds.length > 0) {
          selectObjects(newIds);
          updateSelectionVisuals();
        }
      }
    };

    return tool;
  };

  const createRectangleTool = () => {
    const tool = new paper.Tool();
    let rectangle: paper.Path.Rectangle | null = null;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      rectangle = new paper.Path.Rectangle(event.point, event.point);
      rectangle.strokeColor = new paper.Color(strokeColor);
      rectangle.fillColor = new paper.Color(fillColor);
      rectangle.strokeWidth = strokeWidth;
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (rectangle) {
        rectangle.remove();
        rectangle = new paper.Path.Rectangle(event.downPoint, event.point);
        rectangle.strokeColor = new paper.Color(strokeColor);
        rectangle.fillColor = new paper.Color(fillColor);
        rectangle.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (rectangle) {
        const canvasObject = createCanvasObject(rectangle, 'shape');
        addObject(canvasObject);
        rectangle = null;
      }
    };

    return tool;
  };

  const createEllipseTool = () => {
    const tool = new paper.Tool();
    let ellipse: paper.Path.Ellipse | null = null;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      ellipse = new paper.Path.Ellipse(new paper.Rectangle(event.point, event.point));
      ellipse.strokeColor = new paper.Color(strokeColor);
      ellipse.fillColor = new paper.Color(fillColor);
      ellipse.strokeWidth = strokeWidth;
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (ellipse) {
        ellipse.remove();
        ellipse = new paper.Path.Ellipse(new paper.Rectangle(event.downPoint, event.point));
        ellipse.strokeColor = new paper.Color(strokeColor);
        ellipse.fillColor = new paper.Color(fillColor);
        ellipse.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (ellipse) {
        const canvasObject = createCanvasObject(ellipse, 'shape');
        addObject(canvasObject);
        ellipse = null;
      }
    };

    return tool;
  };

  const createLineTool = () => {
    const tool = new paper.Tool();
    let line: paper.Path | null = null;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      line = new paper.Path();
      line.add(event.point);
      line.strokeColor = new paper.Color(strokeColor);
      line.strokeWidth = strokeWidth;
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (line && line.segments.length > 1) {
        line.removeSegment(1);
      }
      if (line) {
        line.add(event.point);
      }
    };

    tool.onMouseUp = () => {
      if (line) {
        const canvasObject = createCanvasObject(line, 'path');
        addObject(canvasObject);
        line = null;
      }
    };

    return tool;
  };

  const createPenTool = () => {
    const tool = new paper.Tool();
    let path: paper.Path | null = null;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      path = new paper.Path();
      path.add(event.point);
      path.strokeColor = new paper.Color(strokeColor);
      path.strokeWidth = strokeWidth;
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (path) {
        path.add(event.point);
      }
    };

    tool.onMouseUp = () => {
      if (path) {
        path.smooth();
        const canvasObject = createCanvasObject(path, 'path');
        addObject(canvasObject);
        path = null;
      }
    };

    return tool;
  };

  const createTextTool = () => {
    const tool = new paper.Tool();

    tool.onMouseDown = (event: paper.ToolEvent) => {
      const text = new paper.PointText({
        point: event.point,
        content: 'Text',
        fillColor: new paper.Color(fillColor),
        fontFamily: 'Arial',
        fontSize: 16
      });
      
      const canvasObject = createCanvasObject(text, 'text');
      addObject(canvasObject);
    };

    return tool;
  };

  const createHandTool = () => {
    const tool = new paper.Tool();
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (paper.view) {
        paper.view.center = paper.view.center.subtract(event.delta);
      }
    };

    return tool;
  };

  // New tool implementations
  const createLassoTool = () => {
    const tool = new paper.Tool();
    let localLassoPath: paper.Path | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      // Create a visible lasso path with dotted line
      localLassoPath = new paper.Path();
      localLassoPath.strokeColor = new paper.Color('#0066ff');
      localLassoPath.strokeWidth = 1;
      localLassoPath.dashArray = [5, 5];
      localLassoPath.opacity = 0.7;
      localLassoPath.add(event.point);
      setLassoPath(localLassoPath);
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (localLassoPath) {
        localLassoPath.add(event.point);
        localLassoPath.smooth({ type: 'continuous', factor: 0.3 });
      }
    };
    
    tool.onMouseUp = (event: paper.ToolEvent) => {
      if (localLassoPath) {
        // Close the path for selection
        localLassoPath.closed = true;
        
        // Find items within the lasso path
        const selectedIds: string[] = [];
        Object.entries(objects).forEach(([id, obj]) => {
          if (obj.paperItem && localLassoPath) {
            // Check if item is within the lasso path
            if (localLassoPath.contains(obj.paperItem.position) || 
                localLassoPath.intersects(obj.paperItem)) {
              selectedIds.push(id);
            }
          }
        });
        
        if (selectedIds.length > 0) {
          if (event.modifiers.shift) {
            addToSelection(selectedIds);
          } else {
            selectObjects(selectedIds);
          }
          
          // Legacy compatibility
          if (onSelectionChange) {
            const selectedItems = selectedIds.map(id => objects[id]?.paperItem).filter(Boolean);
            onSelectionChange(selectedItems);
          }
        }
        
        // Remove the lasso path
        localLassoPath.remove();
        localLassoPath = null;
        setLassoPath(null);
      }
    };

    return tool;
  };

  const createMagicWandTool = () => {
    const tool = new paper.Tool();
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      // Get the color at the clicked point
      const hitResult = paper.project.hitTest(event.point, {
        fill: true,
        stroke: true,
        tolerance: 5
      });
      
      if (hitResult && hitResult.item) {
        let targetColor: paper.Color | null = null;
        
        // Get the color of the clicked item
        if (hitResult.type === 'fill' && 'fillColor' in hitResult.item) {
          targetColor = (hitResult.item as paper.Path).fillColor;
        } else if (hitResult.type === 'stroke' && 'strokeColor' in hitResult.item) {
          targetColor = (hitResult.item as paper.Path).strokeColor;
        }
        
        if (targetColor) {
          // Find all items with similar color
          const tolerance = 0.1; // Color similarity tolerance (0-1)
          const selectedIds: string[] = [];
          
          Object.entries(objects).forEach(([id, obj]) => {
            if (obj.paperItem && 'fillColor' in obj.paperItem) {
              const itemColor = (obj.paperItem as paper.Path).fillColor;
              if (itemColor && colorsSimilar(targetColor, itemColor, tolerance)) {
                selectedIds.push(id);
              }
            }
          });
          
          if (selectedIds.length > 0) {
            if (event.modifiers.shift) {
              addToSelection(selectedIds);
            } else {
              selectObjects(selectedIds);
            }
            
            if (onSelectionChange) {
              const selectedItems = selectedIds.map(id => objects[id]?.paperItem).filter(Boolean);
              onSelectionChange(selectedItems);
            }
          }
        }
      }
    };
    
    // Helper function to check color similarity
    const colorsSimilar = (color1: paper.Color, color2: paper.Color, tolerance: number): boolean => {
      if (!color1 || !color2) return false;
      
      const diff = Math.sqrt(
        Math.pow(color1.red - color2.red, 2) +
        Math.pow(color1.green - color2.green, 2) +
        Math.pow(color1.blue - color2.blue, 2)
      );
      
      return diff <= tolerance * Math.sqrt(3); // Normalize to 0-1 range
    };

    return tool;
  };

  const createTriangleTool = () => {
    const tool = new paper.Tool();
    let triangle: paper.Path.RegularPolygon | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      triangle = new paper.Path.RegularPolygon({
        center: event.point,
        sides: 3,
        radius: 1
      });
      triangle.strokeColor = new paper.Color(strokeColor);
      triangle.fillColor = new paper.Color(fillColor);
      triangle.strokeWidth = strokeWidth;
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (triangle) {
        triangle.remove();
        const from = event.downPoint;
        const to = event.point;
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        
        triangle = new paper.Path.RegularPolygon({
          center: center,
          sides: 3,
          radius: radius
        });
        triangle.strokeColor = new paper.Color(strokeColor);
        triangle.fillColor = new paper.Color(fillColor);
        triangle.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (triangle) {
        const canvasObject = createCanvasObject(triangle, 'shape');
        addObject(canvasObject);
        triangle = null;
      }
    };

    return tool;
  };

  const createStarTool = () => {
    const tool = new paper.Tool();
    let star: paper.Path.Star | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      star = new paper.Path.Star({
        center: event.point,
        points: 5,
        radius1: 1,
        radius2: 0.5
      });
      star.strokeColor = new paper.Color(strokeColor);
      star.fillColor = new paper.Color(fillColor);
      star.strokeWidth = strokeWidth;
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (star) {
        star.remove();
        const from = event.downPoint;
        const to = event.point;
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        
        star = new paper.Path.Star({
          center: center,
          points: 5,
          radius1: radius,
          radius2: radius * 0.5
        });
        star.strokeColor = new paper.Color(strokeColor);
        star.fillColor = new paper.Color(fillColor);
        star.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (star) {
        const canvasObject = createCanvasObject(star, 'shape');
        addObject(canvasObject);
        star = null;
      }
    };

    return tool;
  };

  const createHexagonTool = () => {
    const tool = new paper.Tool();
    let hexagon: paper.Path.RegularPolygon | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      hexagon = new paper.Path.RegularPolygon({
        center: event.point,
        sides: 6,
        radius: 1
      });
      hexagon.strokeColor = new paper.Color(strokeColor);
      hexagon.fillColor = new paper.Color(fillColor);
      hexagon.strokeWidth = strokeWidth;
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (hexagon) {
        hexagon.remove();
        const from = event.downPoint;
        const to = event.point;
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        
        hexagon = new paper.Path.RegularPolygon({
          center: center,
          sides: 6,
          radius: radius
        });
        hexagon.strokeColor = new paper.Color(strokeColor);
        hexagon.fillColor = new paper.Color(fillColor);
        hexagon.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (hexagon) {
        const canvasObject = createCanvasObject(hexagon, 'shape');
        addObject(canvasObject);
        hexagon = null;
      }
    };

    return tool;
  };

  const createPentagonTool = () => {
    const tool = new paper.Tool();
    let pentagon: paper.Path.RegularPolygon | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      pentagon = new paper.Path.RegularPolygon({
        center: event.point,
        sides: 5,
        radius: 1
      });
      pentagon.strokeColor = new paper.Color(strokeColor);
      pentagon.fillColor = new paper.Color(fillColor);
      pentagon.strokeWidth = strokeWidth;
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (pentagon) {
        pentagon.remove();
        const from = event.downPoint;
        const to = event.point;
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        
        pentagon = new paper.Path.RegularPolygon({
          center: center,
          sides: 5,
          radius: radius
        });
        pentagon.strokeColor = new paper.Color(strokeColor);
        pentagon.fillColor = new paper.Color(fillColor);
        pentagon.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (pentagon) {
        const canvasObject = createCanvasObject(pentagon, 'shape');
        addObject(canvasObject);
        pentagon = null;
      }
    };

    return tool;
  };

  const createOctagonTool = () => {
    const tool = new paper.Tool();
    let octagon: paper.Path.RegularPolygon | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      octagon = new paper.Path.RegularPolygon({
        center: event.point,
        sides: 8,
        radius: 1
      });
      octagon.strokeColor = new paper.Color(strokeColor);
      octagon.fillColor = new paper.Color(fillColor);
      octagon.strokeWidth = strokeWidth;
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (octagon) {
        octagon.remove();
        const from = event.downPoint;
        const to = event.point;
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        
        octagon = new paper.Path.RegularPolygon({
          center: center,
          sides: 8,
          radius: radius
        });
        octagon.strokeColor = new paper.Color(strokeColor);
        octagon.fillColor = new paper.Color(fillColor);
        octagon.strokeWidth = strokeWidth;
      }
    };

    tool.onMouseUp = () => {
      if (octagon) {
        const canvasObject = createCanvasObject(octagon, 'shape');
        addObject(canvasObject);
        octagon = null;
      }
    };

    return tool;
  };

  const createBrushTool = () => {
    const tool = new paper.Tool();
    let path: paper.Path | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      path = new paper.Path();
      path.strokeColor = new paper.Color(strokeColor);
      path.strokeWidth = strokeWidth * 4; // Make brush thicker
      path.strokeCap = 'round';
      path.add(event.point);
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (path) {
        path.add(event.point);
        path.smooth({ type: 'catmull-rom', factor: 0.5 });
      }
    };

    tool.onMouseUp = () => {
      if (path) {
        const canvasObject = createCanvasObject(path, 'path');
        addObject(canvasObject);
        path = null;
      }
    };

    return tool;
  };

  const createPaintbrushTool = () => {
    const tool = new paper.Tool();
    let path: paper.Path | null = null;
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      path = new paper.Path();
      path.strokeColor = new paper.Color(fillColor);
      path.strokeWidth = strokeWidth * 6; // Make paintbrush thicker than brush
      path.strokeCap = 'round';
      path.add(event.point);
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (path) {
        path.add(event.point);
        path.smooth({ type: 'catmull-rom', factor: 0.8 });
      }
    };

    tool.onMouseUp = () => {
      if (path) {
        const canvasObject = createCanvasObject(path, 'path');
        addObject(canvasObject);
        path = null;
      }
    };

    return tool;
  };

  const createEraserTool = () => {
    const tool = new paper.Tool();
    
    const eraseAt = (point: paper.Point, tolerance: number = 8) => {
      const hitResult = paper.project.hitTest(point, {
        fill: true,
        stroke: true,
        tolerance
      });
      
      if (hitResult && hitResult.item) {
        // Find the object ID for this paper item
        const objectId = Object.entries(objects).find(([, obj]) => obj.paperItem === hitResult.item)?.[0];
        
        if (objectId) {
          deleteObjects([objectId]);
        }
      }
    };
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      eraseAt(event.point, 5);
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      eraseAt(event.point, 8);
    };

    return tool;
  };

  const createEyedropperTool = () => {
    const tool = new paper.Tool();
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      // Get the pixel color at the clicked position
      const raster = paper.project.activeLayer.rasterize();
      const color = raster.getPixel(event.point);
      
      if (color) {
        // Convert Paper.js color to hex string
        const hexColor = color.toCSS(true);
        
        // Update the fill color by default, or stroke if shift is held
        if (event.modifiers.shift) {
          setStrokeColor(hexColor);
        } else {
          setFillColor(hexColor);
        }
      }
      
      // Clean up the temporary raster
      raster.remove();
    };

    return tool;
  };

  const createZoomTool = () => {
    const tool = new paper.Tool();
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      if (paper.view) {
        // Zoom in on left click, zoom out on right click or with alt/option
        const zoomFactor = event.modifiers.option || event.modifiers.alt ? 0.5 : 2;
        
        // Calculate new zoom level
        const newZoom = paper.view.zoom * zoomFactor;
        
        // Limit zoom between 0.1x and 10x
        if (newZoom >= 0.1 && newZoom <= 10) {
          // Zoom centered on click point
          paper.view.center = event.point;
          paper.view.zoom = newZoom;
        }
      }
    };

    return tool;
  };

  const createCropTool = () => {
    const tool = new paper.Tool();
    let cropRect: paper.Path.Rectangle | null = null;
    let startPoint: paper.Point | null = null;
    let handles: paper.Path.Circle[] = [];
    
    const createHandles = (rect: paper.Path.Rectangle) => {
      // Remove old handles
      handles.forEach(h => h.remove());
      handles = [];
      
      // Create 8 handles (4 corners + 4 edges)
      const bounds = rect.bounds;
      const handlePositions = [
        bounds.topLeft,
        bounds.topCenter,
        bounds.topRight,
        bounds.rightCenter,
        bounds.bottomRight,
        bounds.bottomCenter,
        bounds.bottomLeft,
        bounds.leftCenter
      ];
      
      handlePositions.forEach(pos => {
        const handle = new paper.Path.Circle({
          center: pos,
          radius: 4,
          fillColor: 'white',
          strokeColor: '#0066ff',
          strokeWidth: 2
        });
        handles.push(handle);
      });
    };
    
    tool.onMouseDown = (event: paper.ToolEvent) => {
      // Remove previous crop overlay if exists
      if (cropRect) {
        cropRect.remove();
        handles.forEach(h => h.remove());
        handles = [];
      }
      
      startPoint = event.point;
      cropRect = new paper.Path.Rectangle(event.point, event.point);
      cropRect.strokeColor = new paper.Color('#0066ff');
      cropRect.strokeWidth = 2;
      cropRect.dashArray = [5, 5];
      cropRect.fillColor = new paper.Color(0, 0, 0, 0.3);
      setCropOverlay(cropRect);
    };
    
    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (cropRect && startPoint) {
        cropRect.remove();
        cropRect = new paper.Path.Rectangle(startPoint, event.point);
        cropRect.strokeColor = new paper.Color('#0066ff');
        cropRect.strokeWidth = 2;
        cropRect.dashArray = [5, 5];
        cropRect.fillColor = new paper.Color(0, 0, 0, 0.3);
        setCropOverlay(cropRect);
      }
    };
    
    tool.onMouseUp = () => {
      if (cropRect) {
        createHandles(cropRect);
      }
    };
    
    tool.onKeyDown = (event: paper.KeyEvent) => {
      // Apply crop on Enter key
      if (event.key === 'enter' && cropRect) {
        const bounds = cropRect.bounds;
        
        // Crop all items to the bounds
        Object.values(objects).forEach(obj => {
          if (obj.paperItem) {
            // Check if item is within crop bounds
            if (obj.paperItem.bounds.intersects(bounds)) {
              // For now, just keep items that are within bounds
              // In a production app, you'd actually clip the paths
              if (!bounds.contains(obj.paperItem.bounds)) {
                // Item is partially outside - you could clip it here
                // For simplicity, we'll just keep it if its center is inside
                if (!bounds.contains(obj.paperItem.position)) {
                  obj.paperItem.visible = false;
                }
              }
            } else {
              // Item is completely outside crop area
              obj.paperItem.visible = false;
            }
          }
        });
        
        // Adjust view to cropped area
        if (paper.view) {
          paper.view.center = bounds.center;
        }
        
        // Clean up
        cropRect.remove();
        handles.forEach(h => h.remove());
        handles = [];
        cropRect = null;
        setCropOverlay(null);
      }
      
      // Cancel crop on Escape
      if (event.key === 'escape' && cropRect) {
        cropRect.remove();
        handles.forEach(h => h.remove());
        handles = [];
        cropRect = null;
        setCropOverlay(null);
      }
    };

    return tool;
  };

  return (
    <div 
      className="flex-1 overflow-hidden relative"
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      <div 
        className="w-full h-full overflow-hidden relative"
        style={{ 
          backgroundColor: theme.colors.canvas.background,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ 
            cursor: getCursorForTool(activeTool),
            display: 'block',
          }}
        />
        
        {/* Selection overlay for visual indicators and handles */}
        {activeTool === 'select' && (
          <SelectionOverlay />
        )}
      </div>
    </div>
  );
}