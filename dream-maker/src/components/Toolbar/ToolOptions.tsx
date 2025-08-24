import { Settings, Sliders } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../contexts/ThemeContext';

export function ToolOptions() {
  const { activeTool, strokeWidth, setStrokeWidth } = useDesignStore();
  const { theme } = useTheme();

  const getToolOptions = () => {
    switch (activeTool) {
      case 'pen':
      case 'brush':
      case 'paintbrush':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="1"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'eraser':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="5"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'rectangle':
      case 'ellipse':
      case 'triangle':
      case 'star':
      case 'hexagon':
      case 'pentagon':
      case 'octagon':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Width
              </span>
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'line':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Width
              </span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-1">
            <div className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
              Font: 16px
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const toolOptions = getToolOptions();

  if (!toolOptions) return null;

  return (
    <div className="border-t pt-2 mt-2" style={{ borderColor: theme.colors.border.primary }}>
      {toolOptions}
    </div>
  );
}