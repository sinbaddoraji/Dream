import { DockableToolbar } from './components/Toolbar/DockableToolbar'
import { CanvasContainer } from './components/Canvas/CanvasContainer'
import { StatusBar } from './components/StatusBar'
import { MenuBar } from './components/MenuBar'
import { RightSidebar } from './components/RightSidebar'
import { useDesignStore } from './store/designStore'
import { useUIStore } from './store/uiStore'
import { useTheme } from './contexts/ThemeContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

function App() {
  const { theme } = useTheme();
  const { activeTool, fillColor, strokeColor, setFillColor, setStrokeColor, setSelectedItems } = useDesignStore()
  const { toolbar, showStatusBar, rightSidebar } = useUIStore();
  
  useKeyboardShortcuts();

  const handleSelectionChange = (items: any[]) => {
    setSelectedItems(items)
  }

  const getCanvasOffset = () => {
    // Start with menu bar height (48px) and status bar height (24px if visible)
    const statusBarHeight = showStatusBar ? 24 : 0;
    const rightSidebarWidth = rightSidebar.isVisible ? 256 : 0; // 64 * 4 = 256px
    const offset = { 
      top: 48, 
      left: 0, 
      right: rightSidebarWidth, 
      bottom: statusBarHeight 
    };
    
    if (toolbar.position === 'left' && !toolbar.isMinimized) {
      offset.left = 200;
    } else if (toolbar.position === 'left' && toolbar.isMinimized) {
      offset.left = 50;
    } else if (toolbar.position === 'right' && !toolbar.isMinimized) {
      offset.right = rightSidebarWidth + 200;
    } else if (toolbar.position === 'right' && toolbar.isMinimized) {
      offset.right = rightSidebarWidth + 50;
    } else if (toolbar.position === 'top' && !toolbar.isMinimized) {
      offset.top = 48 + 130; // 48 for menu bar + 130 for toolbar
    } else if (toolbar.position === 'top' && toolbar.isMinimized) {
      offset.top = 48 + 70; // 48 for menu bar + 70 for minimized toolbar
    } else if (toolbar.position === 'bottom' && !toolbar.isMinimized) {
      offset.bottom = statusBarHeight + 130; // Add toolbar height to status bar height
    } else if (toolbar.position === 'bottom' && toolbar.isMinimized) {
      offset.bottom = statusBarHeight + 70; // Add minimized toolbar height to status bar height
    }

    // Canvas should take all available space without padding
    // Only add minimal padding when floating
    if (toolbar.position === 'floating') {
      // Add minimal padding around the canvas edges only when floating
      if (offset.left === 0) offset.left = 4;
      if (offset.right === rightSidebarWidth) offset.right = rightSidebarWidth + 4;
      if (offset.top === 48) offset.top = 52; // 48 for menu bar + 4 padding
      if (offset.bottom === statusBarHeight) offset.bottom = statusBarHeight + 4; // Add padding to status bar height
      else if (offset.bottom === 0) offset.bottom = 4;
    }

    return offset;
  }

  return (
    <div 
      className="h-screen w-screen relative overflow-hidden flex flex-col"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <MenuBar />
      <div className="flex-1 relative">
        <DockableToolbar 
          fillColor={fillColor}
          strokeColor={strokeColor}
          onFillColorChange={setFillColor}
          onStrokeColorChange={setStrokeColor}
        />
        
        <div 
          className="absolute"
          style={(() => {
            const offset = getCanvasOffset();
            return {
              top: offset.top,
              left: offset.left,
              right: offset.right,
              bottom: offset.bottom,
            };
          })()}
        >
          <ErrorBoundary>
            <CanvasContainer 
              activeTool={activeTool}
              fillColor={fillColor}
              strokeColor={strokeColor}
              onSelectionChange={handleSelectionChange}
            />
          </ErrorBoundary>
        </div>

        <StatusBar />
        <RightSidebar />
      </div>
    </div>
  )
}

export default App
