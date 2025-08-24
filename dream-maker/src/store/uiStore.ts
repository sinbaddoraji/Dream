import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  setToolbarPosition: (position: DockPosition) => void;
  setToolbarMinimized: (minimized: boolean) => void;
  setToolbarFloatingPosition: (x: number, y: number) => void;
  setToolbarSize: (width: number, height: number) => void;
  setShowStatusBar: (show: boolean) => void;
  resetToolbarToDefaults: () => void;
}

const defaultToolbarState: ToolbarState = {
  position: 'left',
  isMinimized: false,
  floatingPosition: { x: 20, y: 100 },
  size: { width: 200, height: 400 }
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      toolbar: defaultToolbarState,
      showStatusBar: true,
      
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
      
      resetToolbarToDefaults: () => 
        set({ toolbar: { ...defaultToolbarState } })
    }),
    {
      name: 'dream-maker-ui-preferences',
      partialize: (state) => ({ 
        toolbar: state.toolbar,
        showStatusBar: state.showStatusBar 
      }),
    }
  )
);