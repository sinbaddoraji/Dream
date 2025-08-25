import { useState, useEffect } from 'react';
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  Square,
  Circle,
  Minus,
  Type,
  Pen,
  Brush,
  Image,
  Trash2,
  Move,
  X,
  Clock,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useDrawHistory } from '../../hooks/useDrawHistory';
import type { DrawAction, DrawActionType } from '../../types/history';

const ACTION_ICONS: Record<DrawActionType, any> = {
  create_rectangle: Square,
  create_ellipse: Circle,
  create_line: Minus,
  create_text: Type,
  create_pen_stroke: Pen,
  create_brush_stroke: Brush,
  import_image: Image,
  delete_object: Trash2,
  transform_object: Move,
  move_object: Move,
  clear_canvas: X
};

interface HistoryPanelProps {
  compact?: boolean;
  className?: string;
}

export function HistoryPanel({ compact = false, className = '' }: HistoryPanelProps) {
  const { theme } = useTheme();
  const {
    getHistoryState,
    goToAction,
    goToPrevious,
    goToNext,
    goToFirst,
    goToLast,
    canGoBack,
    canGoForward,
    hasHistory,
    currentIndex,
    totalActions
  } = useDrawHistory();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const historyState = getHistoryState();

  // Add keyboard shortcuts for history navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (ctrlOrCmd && event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const renderActionItem = (action: DrawAction, index: number) => {
    const IconComponent = ACTION_ICONS[action.type];
    const isCurrentAction = index === currentIndex;
    const isFutureAction = index > currentIndex;
    const isHovered = hoveredAction === action.id;

    return (
      <div
        key={action.id}
        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
          isCurrentAction ? 'bg-blue-100 border-l-2 border-blue-500' :
          isFutureAction ? 'opacity-50' : ''
        }`}
        style={{
          backgroundColor: isCurrentAction 
            ? theme.colors.interactive.primary + '15' 
            : isHovered 
              ? theme.colors.surface.secondary 
              : 'transparent',
          borderLeft: isCurrentAction ? `2px solid ${theme.colors.interactive.primary}` : 'none'
        }}
        onClick={() => goToAction(index)}
        onMouseEnter={() => setHoveredAction(action.id)}
        onMouseLeave={() => setHoveredAction(null)}
        title={`${action.description} at ${formatTime(action.timestamp)}`}
      >
        <div className="flex-shrink-0">
          {IconComponent && (
            <IconComponent 
              size={compact ? 12 : 14} 
              style={{ color: isFutureAction ? theme.colors.text.secondary : theme.colors.text.primary }}
            />
          )}
        </div>
        
        {!compact && (
          <div className="flex-1 min-w-0">
            <div 
              className="text-xs font-medium truncate"
              style={{ color: isFutureAction ? theme.colors.text.secondary : theme.colors.text.primary }}
            >
              {action.description}
            </div>
            <div 
              className="text-xs opacity-75"
              style={{ color: theme.colors.text.secondary }}
            >
              {formatRelativeTime(action.timestamp)}
            </div>
          </div>
        )}

        {compact && (
          <div 
            className="text-xs"
            style={{ color: theme.colors.text.secondary }}
          >
            {index + 1}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`border-t ${className}`}
      style={{ borderColor: theme.colors.border.primary }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDown size={12} />}
          <Clock size={12} />
          <span 
            className="text-xs font-medium"
            style={{ color: theme.colors.text.primary }}
          >
            History
          </span>
          {totalActions > 0 && (
            <span 
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: theme.colors.surface.secondary,
                color: theme.colors.text.secondary 
              }}
            >
              {currentIndex + 1}/{totalActions}
            </span>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Navigation Controls */}
          <div 
            className="flex items-center justify-center gap-1 p-2 border-b"
            style={{ borderColor: theme.colors.border.primary }}
          >
            <button
              onClick={goToFirst}
              disabled={!canGoBack}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First action"
            >
              <ChevronFirst size={12} />
            </button>
            <button
              onClick={goToPrevious}
              disabled={!canGoBack}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous action (Ctrl+Left)"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={goToNext}
              disabled={!canGoForward}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next action (Ctrl+Right)"
            >
              <ChevronRight size={12} />
            </button>
            <button
              onClick={goToLast}
              disabled={!canGoForward}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Latest action"
            >
              <ChevronLast size={12} />
            </button>
          </div>

          {/* History List */}
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {hasHistory ? (
              <div className="space-y-1 p-2">
                {historyState.actions.map((action, index) => renderActionItem(action, index))}
              </div>
            ) : (
              <div 
                className="text-center py-6 text-xs"
                style={{ color: theme.colors.text.secondary }}
              >
                No drawing actions yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}