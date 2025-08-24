import { 
  MousePointer2, 
  Square, 
  Circle, 
  Minus, 
  Pen, 
  Type, 
  Pipette, 
  ZoomIn, 
  Hand 
} from 'lucide-react';
import { useDesignStore, type Tool } from '../store/designStore';
import { useTheme } from '../contexts/ThemeContext';

interface ToolbarProps {
  fillColor: string;
  strokeColor: string;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
}

export function Toolbar({ fillColor, strokeColor, onFillColorChange, onStrokeColorChange }: ToolbarProps) {
  const { activeTool, setActiveTool } = useDesignStore();
  const { theme } = useTheme();
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Select' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'ellipse' as Tool, icon: Circle, label: 'Ellipse' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
    { id: 'pen' as Tool, icon: Pen, label: 'Pen' },
    { id: 'text' as Tool, icon: Type, label: 'Text' },
    { id: 'eyedropper' as Tool, icon: Pipette, label: 'Eyedropper' },
    { id: 'zoom' as Tool, icon: ZoomIn, label: 'Zoom' },
    { id: 'hand' as Tool, icon: Hand, label: 'Hand' },
  ];

  return (
    <div 
      className="border-r p-2 flex flex-col gap-1 min-w-[60px]"
      style={{
        backgroundColor: theme.colors.toolbar.background,
        borderColor: theme.colors.border.primary,
      }}
    >
      {tools.map((tool) => {
        const IconComponent = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: isActive ? theme.colors.toolbar.buttonActive : theme.colors.surface.primary,
              color: isActive ? theme.colors.toolbar.buttonTextActive : theme.colors.toolbar.buttonText,
              borderColor: isActive ? theme.colors.toolbar.buttonActive : theme.colors.border.primary,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = theme.colors.toolbar.buttonHover;
                e.currentTarget.style.borderColor = theme.colors.border.secondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = theme.colors.surface.primary;
                e.currentTarget.style.borderColor = theme.colors.border.primary;
              }
            }}
            title={tool.label}
          >
            <IconComponent size={18} className="mb-1" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        );
      })}
      
      <div 
        className="border-t mt-2 pt-2"
        style={{ borderColor: theme.colors.border.primary }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center">
            <div 
              className="w-6 h-6 border rounded cursor-pointer" 
              style={{ 
                backgroundColor: fillColor,
                borderColor: theme.colors.border.primary
              }}
              title="Fill Color"
              onClick={() => {
                const color = prompt('Enter fill color:', fillColor);
                if (color) onFillColorChange(color);
              }}
            ></div>
          </div>
          <div className="flex items-center justify-center">
            <div 
              className="w-6 h-6 bg-transparent border-2 rounded cursor-pointer" 
              style={{ borderColor: strokeColor }}
              title="Stroke Color"
              onClick={() => {
                const color = prompt('Enter stroke color:', strokeColor);
                if (color) onStrokeColorChange(color);
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
