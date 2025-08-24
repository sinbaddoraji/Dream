import { useDesignStore } from '../store/designStore';
import { useUIStore } from '../store/uiStore';
import { useTheme } from '../contexts/ThemeContext';

export function StatusBar() {
  const { activeTool, selectedItems } = useDesignStore();
  const { showStatusBar } = useUIStore();
  const { theme } = useTheme();

  if (!showStatusBar) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-6 px-4 flex items-center justify-between text-xs border-t z-30"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.primary,
        color: theme.colors.text.secondary
      }}
    >
      <div className="flex items-center gap-4">
        <span>
          Tool: <span className="font-medium capitalize">{activeTool}</span>
        </span>
        {selectedItems.length > 0 && (
          <span>
            Selected: <span className="font-medium">{selectedItems.length} item(s)</span>
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span>Zoom: 100%</span>
        <span>Canvas: 800 × 600</span>
        <span>Ready</span>
      </div>
    </div>
  );
}