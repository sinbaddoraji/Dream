import { useDesignStore } from '../store/designStore';
import { useUIStore } from '../store/uiStore';
import { useTheme } from '../hooks/useTheme';
import { PersistenceService } from '../services/PersistenceService';
import { useState, useEffect } from 'react';

export function StatusBar() {
  const { activeTool, selectedItems } = useDesignStore();
  const { showStatusBar } = useUIStore();
  const { theme } = useTheme();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Check for last save time on mount and update periodically
  useEffect(() => {
    const updateLastSaveTime = () => {
      const saveTime = PersistenceService.getLastSaveTime();
      setLastSaveTime(saveTime);
    };

    // Initial check
    updateLastSaveTime();

    // Update every 30 seconds to show relative time
    const interval = setInterval(updateLastSaveTime, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatLastSaveTime = (time: Date | null): string => {
    if (!time) return 'Never saved';
    
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) {
      return 'Saved just now';
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes}m ago`;
    } else {
      return `Saved at ${time.toLocaleTimeString()}`;
    }
  };

  if (!showStatusBar) return null;

  // Get tool-specific instructions
  const getToolInstructions = (tool: string) => {
    switch (tool) {
      case 'crop':
        return 'Click and drag to select crop area. Use handles to resize. Press Enter to apply, Escape to cancel.';
      case 'select':
        return 'Click objects to select them. Drag to move selected objects.';
      case 'rectangle':
      case 'ellipse':
      case 'triangle':
      case 'star':
      case 'pentagon':
      case 'hexagon':
      case 'octagon':
        return 'Click and drag to draw shape.';
      case 'line':
        return 'Click and drag to draw line.';
      case 'pen':
        return 'Click and drag to draw freehand.';
      case 'brush':
        return 'Click and drag to paint with brush.';
      case 'text':
        return 'Click to place text.';
      case 'eraser':
        return 'Click on objects to delete them.';
      case 'hand':
        return 'Click and drag to pan the canvas.';
      case 'zoom':
        return 'Click to zoom in, Shift+click to zoom out.';
      case 'eyedropper':
        return 'Click on any color to pick it.';
      default:
        return '';
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-6 px-4 flex items-center justify-between text-xs border-t z-30"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.primary,
        color: theme.colors.text.secondary
      }}
    >
      <div className="flex items-center gap-4">
        <span>
          Tool: <span className="font-medium capitalize">{activeTool}</span>
        </span>
        {selectedItems.length > 0 && (
          <span>
            Selected: <span className="font-medium">{selectedItems.length} item(s)</span>
          </span>
        )}
        {getToolInstructions(activeTool) && (
          <span className="text-gray-500">
            {getToolInstructions(activeTool)}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span>Zoom: 100%</span>
        <span>Canvas: 800 × 600</span>
        <span>{formatLastSaveTime(lastSaveTime)}</span>
      </div>
    </div>
  );
}