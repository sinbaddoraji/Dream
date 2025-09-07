// Persistence service to save and restore canvas state
export interface CanvasState {
  shapes: any[];
  objects: Record<string, any>;
  canvasScale: number;
  canvasX: number;
  canvasY: number;
  timestamp: number;
}

export class PersistenceService {
  private static readonly STORAGE_KEY = 'dream-maker-canvas-state';
  private static readonly AUTO_SAVE_INTERVAL = 5000; // 5 seconds
  private static autoSaveTimer: NodeJS.Timeout | null = null;

  /**
   * Save canvas state to localStorage
   */
  static saveState(state: CanvasState): void {
    try {
      const stateWithTimestamp = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateWithTimestamp));
      console.log('Canvas state saved to localStorage');
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    }
  }

  /**
   * Load canvas state from localStorage
   */
  static loadState(): CanvasState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;

      const state = JSON.parse(saved) as CanvasState;
      
      // Check if state is not too old (optional - removes state older than 7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - state.timestamp > maxAge) {
        this.clearState();
        return null;
      }

      console.log('Canvas state loaded from localStorage');
      return state;
    } catch (error) {
      console.error('Failed to load canvas state:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Canvas state cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear canvas state:', error);
    }
  }

  /**
   * Start auto-save timer
   */
  static startAutoSave(getState: () => CanvasState): void {
    this.stopAutoSave(); // Clear any existing timer
    
    this.autoSaveTimer = setInterval(() => {
      const state = getState();
      this.saveState(state);
    }, this.AUTO_SAVE_INTERVAL);

    console.log('Auto-save started (every 5 seconds)');
  }

  /**
   * Stop auto-save timer
   */
  static stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('Auto-save stopped');
    }
  }

  /**
   * Manual save trigger
   */
  static manualSave(getState: () => CanvasState): void {
    const state = getState();
    this.saveState(state);
  }

  /**
   * Check if there's a saved state available
   */
  static hasSavedState(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Get the timestamp of the last saved state
   */
  static getLastSaveTime(): Date | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;

      const state = JSON.parse(saved) as CanvasState;
      return new Date(state.timestamp);
    } catch (error) {
      console.error('Failed to get last save time:', error);
      return null;
    }
  }
}
