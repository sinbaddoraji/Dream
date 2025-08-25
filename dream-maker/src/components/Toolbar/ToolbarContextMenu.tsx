import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';

interface ToolbarContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ToolbarContextMenu({ x, y, onClose }: ToolbarContextMenuProps) {
  const { theme } = useTheme();
  const { resetToolOrder } = useUIStore();

  const handleResetToolOrder = () => {
    resetToolOrder();
    onClose();
  };

  return (
    <>
      {/* Overlay to close menu */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-50 min-w-48 py-2 rounded-lg shadow-lg border"
        style={{
          left: x,
          top: y,
          backgroundColor: theme.colors.surface.elevated,
          borderColor: theme.colors.border.primary,
          boxShadow: theme.shadows.large,
        }}
      >
        <button
          onClick={handleResetToolOrder}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
          style={{ color: theme.colors.text.primary }}
        >
          <RotateCcw size={14} />
          Reset Tool Order
        </button>
        
        <div 
          className="h-px my-1 mx-2"
          style={{ backgroundColor: theme.colors.border.primary }}
        />
        
        <div className="px-3 py-2">
          <div 
            className="text-xs"
            style={{ color: theme.colors.text.secondary }}
          >
            Drag tools to reorder them
          </div>
        </div>
      </div>
    </>
  );
}