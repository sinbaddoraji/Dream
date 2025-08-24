import { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle, 
  Triangle,
  Star,
  Hexagon,
  Pentagon,
  Octagon,
  Minus
} from 'lucide-react';
import { useDesignStore, type Tool } from '../../store/designStore';
import { useTheme } from '../../contexts/ThemeContext';

const shapeTools = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { id: 'pentagon', icon: Pentagon, label: 'Pentagon' },
  { id: 'octagon', icon: Octagon, label: 'Octagon' },
  { id: 'line', icon: Minus, label: 'Line' },
] as const;

interface ShapeSelectorProps {
  isActive: boolean;
  onShapeSelect: (shape: Tool) => void;
}

export function ShapeSelector({ isActive, onShapeSelect }: ShapeSelectorProps) {
  const { selectedShape, setSelectedShape } = useDesignStore();
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && 
          !buttonRef.current?.contains(event.target as Node) &&
          !menuRef.current?.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const currentShape = shapeTools.find(shape => shape.id === selectedShape) || shapeTools[0];
  const CurrentShapeIcon = currentShape.icon;

  const handleShapeClick = (shapeId: Tool) => {
    setSelectedShape(shapeId);
    onShapeSelect(shapeId);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="relative flex items-center justify-center p-1.5 rounded border transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: isActive 
            ? theme.colors.toolbar.buttonActive 
            : theme.colors.surface.primary,
          color: isActive 
            ? theme.colors.toolbar.buttonTextActive 
            : theme.colors.toolbar.buttonText,
          borderColor: isActive 
            ? theme.colors.toolbar.buttonActive 
            : theme.colors.border.primary,
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
        title="Shapes (G)"
      >
        <CurrentShapeIcon size={18} />
        <span 
          className="absolute top-0 right-0 text-[8px] px-0.5 py-0.5 rounded-bl-sm rounded-tr-sm opacity-70"
          style={{ 
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.secondary 
          }}
        >
          G
        </span>
      </button>

      {showMenu && (
        <div 
          ref={menuRef}
          className="fixed p-2 rounded-lg border shadow-lg z-50"
          style={{
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.primary,
            boxShadow: theme.shadows.medium,
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right + 8 : 0,
            top: buttonRef.current ? buttonRef.current.getBoundingClientRect().top : 0,
          }}
        >
          <div className="grid grid-cols-2 gap-1 min-w-[120px]">
            {shapeTools.map((shape) => {
              const ShapeIcon = shape.icon;
              const isSelected = selectedShape === shape.id;
              return (
                <button
                  key={shape.id}
                  onClick={() => handleShapeClick(shape.id as Tool)}
                  className="flex items-center justify-center p-2 rounded border transition-colors"
                  style={{
                    backgroundColor: isSelected 
                      ? theme.colors.toolbar.buttonActive 
                      : theme.colors.surface.primary,
                    color: isSelected 
                      ? theme.colors.toolbar.buttonTextActive 
                      : theme.colors.toolbar.buttonText,
                    borderColor: isSelected 
                      ? theme.colors.toolbar.buttonActive 
                      : theme.colors.border.primary,
                  }}
                  title={shape.label}
                >
                  <ShapeIcon size={14} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}