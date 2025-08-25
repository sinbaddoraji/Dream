import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tool } from './designStore';

export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'floating';

interface ToolbarState {
  position: DockPosition;
  isMinimized: boolean;
  floatingPosition: { x: number; y: number };
  size: { width: number; height: number };
}

interface UIStore {
  toolbar: ToolbarState;
  showStatusBar: boolean;
  rightSidebar: {
    isVisible: boolean;
    droppedTools: string[];
  };
  toolOrder: Tool[];
  
  setToolbarPosition: (position: DockPosition) => void;
  setToolbarMinimized: (minimized: boolean) => void;
  setToolbarFloatingPosition: (x: number, y: number) => void;
  setToolbarSize: (width: number, height: number) => void;
  setShowStatusBar: (show: boolean) => void;
  setRightSidebarVisible: (visible: boolean) => void;
  addToolToRightSidebar: (toolId: string) => void;
  removeToolFromRightSidebar: (toolId: string) => void;
  resetToolbarToDefaults: () => void;
  setToolOrder: (order: Tool[]) => void;
  reorderTool: (fromIndex: number, toIndex: number) => void;
  resetToolOrder: () => void;
}

const defaultToolbarState: ToolbarState = {
  position: 'left',
  isMinimized: false,
  floatingPosition: { x: 20, y: 100 },
  size: { width: 200, height: 400 }
};

const defaultToolOrder: Tool[] = [
  'select',
  'pen', 
  'brush',
  'eraser',
  'shapes',
  'text',
  'eyedropper',
  'crop',
  'zoom',
  'hand'
];

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      toolbar: defaultToolbarState,
      showStatusBar: true,
      rightSidebar: {
        isVisible: false,
        droppedTools: []
      },
      toolOrder: [...defaultToolOrder],
      
      setToolbarPosition: (position) => 
        set((state) => ({ 
          toolbar: { ...state.toolbar, position } 
        })),
        
      setToolbarMinimized: (isMinimized) => 
        set((state) => ({ 
          toolbar: { ...state.toolbar, isMinimized } 
        })),
        
      setToolbarFloatingPosition: (x, y) => 
        set((state) => ({ 
          toolbar: { ...state.toolbar, floatingPosition: { x, y } } 
        })),
        
      setToolbarSize: (width, height) => 
        set((state) => ({ 
          toolbar: { ...state.toolbar, size: { width, height } } 
        })),
        
      setShowStatusBar: (showStatusBar) => set({ showStatusBar }),
      
      setRightSidebarVisible: (isVisible) =>
        set((state) => ({
          rightSidebar: { ...state.rightSidebar, isVisible }
        })),
        
      addToolToRightSidebar: (toolId) =>
        set((state) => ({
          rightSidebar: {
            ...state.rightSidebar,
            droppedTools: state.rightSidebar.droppedTools.includes(toolId) 
              ? state.rightSidebar.droppedTools 
              : [...state.rightSidebar.droppedTools, toolId]
          }
        })),
        
      removeToolFromRightSidebar: (toolId) =>
        set((state) => ({
          rightSidebar: {
            ...state.rightSidebar,
            droppedTools: state.rightSidebar.droppedTools.filter(id => id !== toolId)
          }
        })),
      
      resetToolbarToDefaults: () => 
        set({ toolbar: { ...defaultToolbarState } }),
      
      setToolOrder: (toolOrder: Tool[]) => set({ toolOrder }),
      
      reorderTool: (fromIndex: number, toIndex: number) => 
        set((state) => {
          const newOrder = [...state.toolOrder];
          const [movedTool] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, movedTool);
          return { toolOrder: newOrder };
        }),
        
      resetToolOrder: () => set({ toolOrder: [...defaultToolOrder] })
    }),
    {
      name: 'dream-maker-ui-preferences',
      partialize: (state) => ({ 
        toolbar: state.toolbar,
        showStatusBar: state.showStatusBar,
        rightSidebar: state.rightSidebar,
        toolOrder: state.toolOrder
      }),
    }
  )
);