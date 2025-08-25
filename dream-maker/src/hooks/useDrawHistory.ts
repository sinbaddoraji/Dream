import { useCallback } from 'react';
import { useDesignStore } from '../store/designStore';
import type { DrawAction, DrawActionType, HistoryState } from '../types/history';
import { ACTION_DESCRIPTIONS } from '../types/history';

export function useDrawHistory() {
  const {
    history,
    historyIndex,
    canvasScale,
    canvasX,
    canvasY,
    objects,
    setHistory,
    setHistoryIndex
  } = useDesignStore();

  const generateActionId = useCallback(() => {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const addAction = useCallback((
    type: DrawActionType,
    objectIds: string[],
    data?: any,
    customDescription?: string
  ) => {
    const action: DrawAction = {
      id: generateActionId(),
      timestamp: Date.now(),
      type,
      description: customDescription || ACTION_DESCRIPTIONS[type],
      objectIds,
      data: data || {},
      canvasState: {
        objectCount: Object.keys(objects).length,
        scale: canvasScale,
        position: { x: canvasX, y: canvasY }
      }
    };

    const currentHistory = history as DrawAction[];
    const newHistory = [
      ...currentHistory.slice(0, historyIndex + 1),
      action
    ];

    // Limit history size to prevent memory issues
    const maxSize = 100;
    const trimmedHistory = newHistory.length > maxSize 
      ? newHistory.slice(-maxSize) 
      : newHistory;

    setHistory(trimmedHistory);
    setHistoryIndex(trimmedHistory.length - 1);
  }, [
    history,
    historyIndex,
    objects,
    canvasScale,
    canvasX,
    canvasY,
    generateActionId,
    setHistory,
    setHistoryIndex
  ]);

  const goToAction = useCallback((index: number) => {
    if (index < 0 || index >= (history as DrawAction[]).length) return;
    setHistoryIndex(index);
    // Note: This doesn't restore the canvas state automatically
    // That would require implementing a more complex state restoration system
  }, [history, setHistoryIndex]);

  const goToPrevious = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, setHistoryIndex]);

  const goToNext = useCallback(() => {
    if (historyIndex < (history as DrawAction[]).length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history, setHistoryIndex]);

  const goToFirst = useCallback(() => {
    if ((history as DrawAction[]).length > 0) {
      setHistoryIndex(0);
    }
  }, [history, setHistoryIndex]);

  const goToLast = useCallback(() => {
    if ((history as DrawAction[]).length > 0) {
      setHistoryIndex((history as DrawAction[]).length - 1);
    }
  }, [history, setHistoryIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, [setHistory, setHistoryIndex]);

  const getCurrentAction = useCallback((): DrawAction | null => {
    const actions = history as DrawAction[];
    if (historyIndex >= 0 && historyIndex < actions.length) {
      return actions[historyIndex];
    }
    return null;
  }, [history, historyIndex]);

  const getHistoryState = useCallback((): HistoryState => {
    return {
      actions: history as DrawAction[],
      currentIndex: historyIndex,
      maxHistorySize: 100
    };
  }, [history, historyIndex]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < (history as DrawAction[]).length - 1;
  const hasHistory = (history as DrawAction[]).length > 0;

  return {
    addAction,
    goToAction,
    goToPrevious,
    goToNext,
    goToFirst,
    goToLast,
    clearHistory,
    getCurrentAction,
    getHistoryState,
    canGoBack,
    canGoForward,
    hasHistory,
    currentIndex: historyIndex,
    totalActions: (history as DrawAction[]).length
  };
}