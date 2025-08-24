import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDesignStore } from '../../store/designStore';
import { CanvasService } from '../../services/CanvasService';
import type { ToolType } from '../../tools/ToolFactory';
import { SelectionOverlay } from './SelectionOverlay';

interface CanvasContainerProps {
  activeTool: string;
  fillColor: string;
  strokeColor: string;
  onSelectionChange?: (items: any[]) => void;
}

export function CanvasContainer({ 
  activeTool, 
  fillColor, 
  strokeColor, 
  onSelectionChange 
}: CanvasContainerProps) {
  const { theme } = useTheme();
  const {
    objects,
    addObject,
    deleteObjects,
    selectObjects,
    addToSelection,
    clearSelection,
    selection,
    strokeWidth
  } = useDesignStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasServiceRef = useRef<CanvasService | null>(null);

  useEffect(() => {
    if (canvasRef.current && !canvasServiceRef.current) {
      canvasServiceRef.current = new CanvasService(canvasRef.current, {
        addObject,
        deleteObjects,
        selectObjects,
        addToSelection,
        clearSelection,
        objects,
        selection,
        onSelectionChange
      });
    }

    return () => {
      if (canvasServiceRef.current) {
        canvasServiceRef.current.destroy();
        canvasServiceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (canvasServiceRef.current) {
      canvasServiceRef.current.updateToolContext({
        objects,
        selection,
        onSelectionChange
      });
    }
  }, [objects, selection, onSelectionChange]);

  useEffect(() => {
    if (canvasServiceRef.current) {
      canvasServiceRef.current.setActiveTool(activeTool as ToolType);
    }
  }, [activeTool]);

  useEffect(() => {
    if (canvasServiceRef.current) {
      canvasServiceRef.current.updateToolConfig({
        fillColor,
        strokeColor,
        strokeWidth
      });
    }
  }, [fillColor, strokeColor, strokeWidth]);

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
            cursor: activeTool === 'hand' ? 'grab' : 'crosshair',
            display: 'block',
          }}
        />
        
        {activeTool === 'select' && (
          <SelectionOverlay canvasRef={canvasRef} />
        )}
      </div>
    </div>
  );
}