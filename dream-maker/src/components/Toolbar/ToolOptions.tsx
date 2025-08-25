import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';

export function ToolOptions() {
  const { activeTool, strokeWidth, setStrokeWidth } = useDesignStore();
  const { theme } = useTheme();

  const getToolOptions = () => {
    switch (activeTool) {
      case 'pen':
      case 'brush':
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

      case 'text': {
        const { fontSize, fontFamily, setFontSize, setFontFamily } = useDesignStore.getState();
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Font Family
              </span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full text-[10px] p-1 rounded"
                style={{
                  backgroundColor: theme.colors.surface.secondary,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Palatino">Palatino</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-6" style={{ color: theme.colors.text.secondary }}>
                {fontSize}px
              </span>
            </div>
          </div>
        );
      }

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