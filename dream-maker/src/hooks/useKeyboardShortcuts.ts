import { useEffect } from 'react';
import { useDesignStore } from '../store/designStore';
import type { Tool } from '../store/designStore';

const keyToToolMap: Record<string, Tool> = {
  'v': 'select',
  'a': 'lasso',
  'w': 'magic-wand',
  'g': 'shapes',
  'p': 'pen',
  'b': 'brush',
  'k': 'paintbrush',
  'd': 'eraser',
  't': 'text',
  'c': 'crop',
  'i': 'eyedropper',
  'z': 'zoom',
  'h': 'hand'
};

export function useKeyboardShortcuts() {
  const {
    setActiveTool,
    selectAll,
    clearSelection,
    deleteObjects,
    duplicateObjects,
    createGroup,
    ungroupObjects,
    lockObjects,
    unlockObjects,
    hideObjects,
    showObjects,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selection,
    getSelectedObjects,
    groups
  } = useDesignStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Handle keyboard shortcuts with modifiers
      if (cmdOrCtrl) {
        const key = event.key.toLowerCase();
        
        switch (key) {
          case 'a':
            event.preventDefault();
            selectAll();
            return;
          case 'c':
            if (selection.selectedIds.length > 0) {
              event.preventDefault();
              duplicateObjects(selection.selectedIds);
            }
            return;
          case 'g':
            if (event.shiftKey) {
              // Ungroup
              event.preventDefault();
              const selectedObjects = getSelectedObjects();
              selectedObjects.forEach(obj => {
                if (obj.parentGroup) {
                  ungroupObjects(obj.parentGroup);
                }
              });
            } else {
              // Group
              event.preventDefault();
              createGroup();
            }
            return;
          case 'l': {
            event.preventDefault();
            const selectedObjects = getSelectedObjects();
            const hasLocked = selectedObjects.some(obj => obj.locked);
            if (hasLocked) {
              unlockObjects(selection.selectedIds);
            } else {
              lockObjects(selection.selectedIds);
            }
            return;
          }
          case 'h': {
            event.preventDefault();
            const selectedObjectsForHide = getSelectedObjects();
            const hasHidden = selectedObjectsForHide.some(obj => !obj.visible);
            if (hasHidden) {
              showObjects(selection.selectedIds);
            } else {
              hideObjects(selection.selectedIds);
            }
            return;
          }
          case ']':
            event.preventDefault();
            if (event.shiftKey) {
              bringToFront(selection.selectedIds);
            } else {
              bringForward(selection.selectedIds);
            }
            return;
          case '[':
            event.preventDefault();
            if (event.shiftKey) {
              sendToBack(selection.selectedIds);
            } else {
              sendBackward(selection.selectedIds);
            }
            return;
        }
        return;
      }

      // Handle single key shortcuts (tool selection)
      if (!event.shiftKey && !event.altKey) {
        const key = event.key.toLowerCase();

        // Special keys
        switch (key) {
          case 'escape':
            event.preventDefault();
            clearSelection();
            return;
          case 'delete':
          case 'backspace':
            if (selection.selectedIds.length > 0) {
              event.preventDefault();
              deleteObjects(selection.selectedIds);
            }
            return;
        }

        // Arrow keys for nudging selected objects
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
          if (selection.selectedIds.length > 0) {
            event.preventDefault();
            const nudgeDistance = event.shiftKey ? 10 : 1;
            const selectedObjects = getSelectedObjects();
            
            let deltaX = 0, deltaY = 0;
            switch (key) {
              case 'arrowup': deltaY = -nudgeDistance; break;
              case 'arrowdown': deltaY = nudgeDistance; break;
              case 'arrowleft': deltaX = -nudgeDistance; break;
              case 'arrowright': deltaX = nudgeDistance; break;
            }
            
            selectedObjects.forEach(obj => {
              obj.paperItem.position = obj.paperItem.position.add(new paper.Point(deltaX, deltaY));
            });
          }
          return;
        }

        // Tool shortcuts
        const tool = keyToToolMap[key];
        if (tool) {
          event.preventDefault();
          setActiveTool(tool);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTool,
    selectAll,
    clearSelection,
    deleteObjects,
    duplicateObjects,
    createGroup,
    ungroupObjects,
    lockObjects,
    unlockObjects,
    hideObjects,
    showObjects,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selection,
    getSelectedObjects,
    groups
  ]);
}