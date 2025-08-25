import { useState, useCallback } from 'react';
import { KonvaCanvas } from './KonvaCanvas';

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
  const handleSelectionChange = useCallback((items: any[]) => {
    if (onSelectionChange) {
      onSelectionChange(items);
    }
  }, [onSelectionChange]);

  return (
    <KonvaCanvas
      activeTool={activeTool}
      fillColor={fillColor}
      strokeColor={strokeColor}
      onSelectionChange={handleSelectionChange}
    />
  );
}