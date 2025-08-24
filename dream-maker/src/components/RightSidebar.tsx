import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useDesignStore, type Tool } from '../store/designStore';
import { useTheme } from '../hooks/useTheme';

interface DragOverEvent extends React.DragEvent<HTMLDivElement> {
  dataTransfer: DataTransfer;
}

interface DropEvent extends React.DragEvent<HTMLDivElement> {
  dataTransfer: DataTransfer;
}

export function RightSidebar() {
  const { rightSidebar, setRightSidebarVisible, addToolToRightSidebar, removeToolFromRightSidebar } = useUIStore();
  const { setActiveTool } = useDesignStore();
  const { theme } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);

  if (!rightSidebar.isVisible) return null;

  const handleDragOver = (e: DragOverEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragOverEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DropEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const toolId = e.dataTransfer.getData('text/plain');
    if (toolId) {
      addToolToRightSidebar(toolId);
    }
  };

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId as Tool);
  };

  const handleRemoveTool = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeToolFromRightSidebar(toolId);
  };

  const getToolLabel = (toolId: string) => {
    const labels: Record<string, string> = {
      select: 'Select',
      lasso: 'Lasso',
      pen: 'Pen',
      brush: 'Brush',
      paintbrush: 'Paint Brush',
      eraser: 'Eraser',
      shapes: 'Shapes',
      rectangle: 'Rectangle',
      ellipse: 'Ellipse',
      triangle: 'Triangle',
      star: 'Star',
      hexagon: 'Hexagon',
      pentagon: 'Pentagon',
      octagon: 'Octagon',
      line: 'Line',
      text: 'Text',
      'magic-wand': 'Magic Wand',
      eyedropper: 'Eyedropper',
      crop: 'Crop',
      zoom: 'Zoom',
      hand: 'Hand',
    };
    return labels[toolId] || toolId;
  };

  return (
    <div 
      className="fixed right-0 top-12 z-30 w-64 h-[calc(100vh-72px)] flex flex-col"
      style={{ 
        backgroundColor: theme.colors.toolbar.background,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        boxShadow: '-4px 0 12px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: theme.colors.border.primary }}
      >
        <h3 className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
          Favorite Tools
        </h3>
        <button
          onClick={() => setRightSidebarVisible(false)}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        className={`flex-1 p-4 transition-all duration-200 ${
          isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {rightSidebar.droppedTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: theme.colors.background.secondary }}
            >
              <Plus size={24} style={{ color: theme.colors.text.secondary }} />
            </div>
            <p className="text-sm mb-2" style={{ color: theme.colors.text.primary }}>
              Drop tools here
            </p>
            <p className="text-xs leading-relaxed" style={{ color: theme.colors.text.secondary }}>
              Drag tools from the left toolbar to create quick access shortcuts
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rightSidebar.droppedTools.map((toolId) => (
              <div
                key={toolId}
                className="group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleToolClick(toolId)}
              >
                <span className="text-sm" style={{ color: theme.colors.text.primary }}>
                  {getToolLabel(toolId)}
                </span>
                <button
                  onClick={(e) => handleRemoveTool(toolId, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}