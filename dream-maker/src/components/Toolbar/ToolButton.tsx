import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ToolConfig } from '../../store/designStore';

interface ToolButtonProps {
  tool: ToolConfig;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function ToolButton({ tool, icon: Icon, isActive, onClick }: ToolButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
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
      title={`${tool.label} (${tool.shortcut})`}
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
    </button>
  );
}