import { useRef, useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle,
  Star,
  Hexagon,
  Pentagon,
  Octagon,
  Minus, 
  Pen,
  Brush,
  Eraser,
  Type,
  Crop,
  Pipette, 
  ZoomIn, 
  Hand,
  Dock,
  Minimize2,
  Maximize2,
  Move
} from 'lucide-react';
import { useDesignStore, type Tool, type ToolConfig } from '../../store/designStore';
import { useUIStore, type DockPosition } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { ToolButton } from './ToolButton';
import { ColorPicker } from './ColorPicker';
import { ToolOptions } from './ToolOptions';
import { ShapeSelector } from './ShapeSelector';
import { HistoryPanel } from '../Panels/HistoryPanel';
// import { PropertiesPanel } from '../Panels/PropertiesPanel';

const toolConfigs: ToolConfig[] = [
  // Selection Tools
  { id: 'select', label: 'Select', shortcut: 'V', group: 'tools' },
  
  // Drawing Tools  
  { id: 'pen', label: 'Pen', shortcut: 'P', group: 'tools' },
  { id: 'brush', label: 'Brush', shortcut: 'B', group: 'tools' },
  { id: 'eraser', label: 'Eraser', shortcut: 'D', group: 'tools' },
  
  // Shapes & Text
  { id: 'shapes', label: 'Shapes', shortcut: 'G', group: 'tools' },
  { id: 'text', label: 'Text', shortcut: 'T', group: 'tools' },
  
  // Utilities
  { id: 'eyedropper', label: 'Eyedropper', shortcut: 'I', group: 'tools' },
  { id: 'crop', label: 'Crop', shortcut: 'C', group: 'tools' },
  { id: 'zoom', label: 'Zoom', shortcut: 'Z', group: 'tools' },
  { id: 'hand', label: 'Hand', shortcut: 'H', group: 'tools' },
];

const DOCK_ZONES = {
  left: { x: 0, width: 50 },
  right: (windowWidth: number) => ({ x: windowWidth - 50, width: 50 }),
  top: { y: 0, height: 50 },
  bottom: (windowHeight: number) => ({ y: windowHeight - 50, height: 50 })
};

interface DockableToolbarProps {
  fillColor: string;
  strokeColor: string;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
}

export function DockableToolbar({ 
  fillColor, 
  strokeColor, 
  onFillColorChange, 
  onStrokeColorChange 
}: DockableToolbarProps) {
  const { activeTool, setActiveTool } = useDesignStore();
  const { 
    toolbar, 
    showStatusBar,
    setToolbarPosition, 
    setToolbarMinimized,
    setToolbarFloatingPosition,
    setToolbarSize 
  } = useUIStore();
  const { theme } = useTheme();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragHoverZone, setDragHoverZone] = useState<DockPosition | null>(null);
  const rndRef = useRef<InstanceType<typeof Rnd> | null>(null);

  const isFloating = toolbar.position === 'floating';
  const isDocked = !isFloating;

  const getToolIcon = (toolId: Tool) => {
    const icons = {
      select: MousePointer2,
      shapes: Square, // Default shape icon
      rectangle: Square,
      ellipse: Circle,
      triangle: Triangle,
      star: Star,
      hexagon: Hexagon,
      pentagon: Pentagon,
      octagon: Octagon,
      line: Minus,
      pen: Pen,
      brush: Brush,
      eraser: Eraser,
      text: Type,
      crop: Crop,
      eyedropper: Pipette,
      zoom: ZoomIn,
      hand: Hand,
    };
    return icons[toolId];
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((_e: unknown, data: { x: number; y: number }) => {
    const { x, y } = data;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let hoverZone: DockPosition | null = null;
    
    if (x < DOCK_ZONES.left.width) {
      hoverZone = 'left';
    } else if (x > windowWidth - DOCK_ZONES.right(windowWidth).width) {
      hoverZone = 'right';
    } else if (y < DOCK_ZONES.top.height) {
      hoverZone = 'top';
    } else if (y > windowHeight - DOCK_ZONES.bottom(windowHeight).height) {
      hoverZone = 'bottom';
    }
    
    setDragHoverZone(hoverZone);
  }, []);

  const handleDragStop = useCallback((_e: unknown, data: { x: number; y: number }) => {
    setIsDragging(false);
    const { x, y } = data;
    
    if (dragHoverZone && dragHoverZone !== 'floating') {
      setToolbarPosition(dragHoverZone);
    } else {
      setToolbarFloatingPosition(x, y);
      if (toolbar.position !== 'floating') {
        setToolbarPosition('floating');
      }
    }
    
    setDragHoverZone(null);
  }, [dragHoverZone, toolbar.position, setToolbarPosition, setToolbarFloatingPosition]);

  const handleDockClick = (position: DockPosition) => {
    setToolbarPosition(position);
  };

  const toggleMinimized = () => {
    setToolbarMinimized(!toolbar.isMinimized);
  };

  const getDockedStyle = (position: DockPosition) => {
    const baseStyle = {
      backgroundColor: theme.colors.toolbar.background,
      borderColor: theme.colors.border.primary,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    };

    const menuBarHeight = 48;
    const statusBarHeight = showStatusBar ? 24 : 0;

    switch (position) {
      case 'left':
        return {
          ...baseStyle,
          borderRight: `1px solid ${theme.colors.border.primary}`,
          height: `calc(100vh - ${menuBarHeight + statusBarHeight}px)`, // Subtract menu bar and status bar height
          width: toolbar.isMinimized ? '50px' : '200px',
        };
      case 'right':
        return {
          ...baseStyle,
          borderLeft: `1px solid ${theme.colors.border.primary}`,
          height: `calc(100vh - ${menuBarHeight + statusBarHeight}px)`, // Subtract menu bar and status bar height
          width: toolbar.isMinimized ? '50px' : '200px',
        };
      case 'top':
        return {
          ...baseStyle,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          width: '100%',
          height: toolbar.isMinimized ? '60px' : '130px',
        };
      case 'bottom':
        return {
          ...baseStyle,
          borderTop: `1px solid ${theme.colors.border.primary}`,
          width: '100%',
          height: toolbar.isMinimized ? '60px' : '130px',
        };
      default:
        return baseStyle;
    }
  };

  const renderToolbarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-end p-1" style={{ borderColor: theme.colors.border.primary }}>
        <div className="flex items-center gap-0.5">
          {isFloating && (
            <>
              <button
                onClick={() => handleDockClick('left')}
                className="p-0.5 rounded hover:bg-gray-200"
                title="Dock to left"
              >
                <Dock size={10} />
              </button>
              <button
                className="p-0.5 rounded hover:bg-gray-200 cursor-move"
                title="Drag to move"
              >
                <Move size={10} />
              </button>
            </>
          )}
          <button
            onClick={toggleMinimized}
            className="p-0.5 rounded hover:bg-gray-200"
            title={toolbar.isMinimized ? 'Maximize' : 'Minimize'}
          >
            {toolbar.isMinimized ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
          </button>
        </div>
      </div>

      {!toolbar.isMinimized && (
        <div className="flex-1 p-2 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className={`grid gap-2 ${
              toolbar.position === 'top' || toolbar.position === 'bottom' 
                ? `grid-cols-${Math.min(toolConfigs.length, 8)}` 
                : 'grid-cols-2'
            }`}>
              {toolConfigs.map((toolConfig) => {
                if (toolConfig.id === 'shapes') {
                  return (
                    <ShapeSelector
                      key={toolConfig.id}
                      isActive={activeTool === 'shapes' || 
                        ['rectangle', 'ellipse', 'triangle', 'star', 'hexagon', 'pentagon', 'octagon', 'line'].includes(activeTool)}
                      onShapeSelect={(shape) => {
                        setActiveTool(shape);
                      }}
                    />
                  );
                }
                
                const IconComponent = getToolIcon(toolConfig.id);
                return (
                  <ToolButton
                    key={toolConfig.id}
                    tool={toolConfig}
                    icon={IconComponent}
                    isActive={activeTool === toolConfig.id}
                    onClick={() => setActiveTool(toolConfig.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="border-t mt-2 pt-2 flex-shrink-0" style={{ borderColor: theme.colors.border.primary }}>
            <ColorPicker
              fillColor={fillColor}
              strokeColor={strokeColor}
              onFillColorChange={onFillColorChange}
              onStrokeColorChange={onStrokeColorChange}
            />
            <ToolOptions />
          </div>

          {/* History Panel */}
          {(toolbar.position === 'left' || toolbar.position === 'right') && (
            <HistoryPanel 
              compact={toolbar.position === 'right'} 
              className="flex-shrink-0"
            />
          )}

          {/* Properties Panel - temporarily disabled during Konva migration */}
          {/* toolbar.position === 'left' && (
            <div className="border-t mt-2 pt-2" style={{ borderColor: theme.colors.border.primary }}>
              <PropertiesPanel compact={true} />
            </div>
          ) */}
        </div>
      )}
    </div>
  );

  if (isDocked) {
    return (
      <div
        className="fixed z-20"
        style={{
          ...getDockedStyle(toolbar.position),
          ...(toolbar.position === 'left' && { left: 0, top: 48 }), // Account for menu bar
          ...(toolbar.position === 'right' && { right: 0, top: 48 }), // Account for menu bar
          ...(toolbar.position === 'top' && { top: 48, left: 0 }), // Position below menu bar
          ...(toolbar.position === 'bottom' && { bottom: 0, left: 0 }),
        }}
      >
        {renderToolbarContent()}
      </div>
    );
  }

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {(['left', 'right', 'top', 'bottom'] as DockPosition[]).map((zone) => (
            <div
              key={zone}
              className={`absolute transition-all duration-200 ${
                dragHoverZone === zone 
                  ? 'bg-blue-200 bg-opacity-50 border-2 border-blue-400' 
                  : 'bg-transparent'
              }`}
              style={{
                ...(zone === 'left' && { left: 0, top: 0, width: 50, height: '100%' }),
                ...(zone === 'right' && { right: 0, top: 0, width: 50, height: '100%' }),
                ...(zone === 'top' && { top: 0, left: 0, width: '100%', height: 50 }),
                ...(zone === 'bottom' && { bottom: 0, left: 0, width: '100%', height: 50 }),
              }}
            />
          ))}
        </div>
      )}

      <Rnd
        ref={rndRef}
        default={{
          x: toolbar.floatingPosition.x,
          y: toolbar.floatingPosition.y,
          width: toolbar.size.width,
          height: toolbar.size.height,
        }}
        minWidth={240}
        minHeight={300}
        bounds="window"
        dragHandleClassName="toolbar-drag-handle"
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          setToolbarSize(ref.offsetWidth, ref.offsetHeight);
          setToolbarFloatingPosition(position.x, position.y);
        }}
        className="z-50"
        style={{
          backgroundColor: theme.colors.toolbar.background,
          borderColor: theme.colors.border.primary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="toolbar-drag-handle cursor-move">
          {renderToolbarContent()}
        </div>
      </Rnd>
    </>
  );
}