import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { ToolConfig } from '../../store/designStore';

interface DraggableToolButtonProps {
  tool: ToolConfig;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, toolId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver?: boolean;
  isBeingDragged?: boolean;
  dragPreview?: boolean;
}

export function DraggableToolButton({ 
  tool, 
  icon: Icon, 
  isActive, 
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver = false,
  isBeingDragged = false,
  dragPreview = false
}: DraggableToolButtonProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/x-tool-id', tool.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, tool.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDrop(e);
  };

  const getButtonStyle = () => {
    let backgroundColor = theme.colors.surface.primary;
    let borderColor = theme.colors.border.primary;
    
    if (isActive) {
      backgroundColor = theme.colors.toolbar.buttonActive;
      borderColor = theme.colors.toolbar.buttonActive;
    } else if (isHovered && !isBeingDragged) {
      backgroundColor = theme.colors.toolbar.buttonHover;
      borderColor = theme.colors.border.secondary;
    }
    
    if (isDragOver) {
      backgroundColor = theme.colors.interactive.primaryHover + '20';
      borderColor = theme.colors.interactive.primary;
    }

    return {
      backgroundColor,
      borderColor,
      color: isActive 
        ? theme.colors.toolbar.buttonTextActive 
        : theme.colors.toolbar.buttonText,
      opacity: isBeingDragged ? 0.5 : 1,
      transform: isBeingDragged ? 'scale(0.95)' : 'scale(1)',
      boxShadow: isDragOver ? `0 0 0 2px ${theme.colors.interactive.primary}` : 'none',
    };
  };

  return (
    <button
      draggable={!dragPreview}
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center p-1.5 rounded border transition-all duration-200 cursor-pointer"
      style={getButtonStyle()}
      title={`${tool.label} (${tool.shortcut})${!dragPreview ? ' - Drag to reorder' : ''}`}
    >
      <Icon size={18} />
      
      {tool.shortcut && (
        <span 
          className="absolute top-0 right-0 text-[8px] px-0.5 py-0.5 rounded-bl-sm rounded-tr-sm opacity-70"
          style={{ 
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.secondary 
          }}
        >
          {tool.shortcut}
        </span>
      )}
      
      {isDragOver && (
        <div 
          className="absolute inset-0 pointer-events-none rounded border-2 border-dashed"
          style={{ 
            borderColor: theme.colors.interactive.primary,
            backgroundColor: theme.colors.interactive.primary + '10'
          }}
        />
      )}
    </button>
  );
}