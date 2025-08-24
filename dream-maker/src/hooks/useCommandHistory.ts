import { useRef, useCallback, useEffect } from 'react';
import { CommandHistory } from '../commands/CommandHistory';
import type { Command } from '../commands/Command';

export function useCommandHistory() {
  const historyRef = useRef(new CommandHistory());

  const execute = useCallback((command: Command) => {
    historyRef.current.execute(command);
  }, []);

  const undo = useCallback(() => {
    return historyRef.current.undo();
  }, []);

  const redo = useCallback(() => {
    return historyRef.current.redo();
  }, []);

  const canUndo = useCallback(() => {
    return historyRef.current.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return historyRef.current.canRedo();
  }, []);

  const clear = useCallback(() => {
    historyRef.current.clear();
  }, []);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (ctrlOrCmd && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    execute,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}