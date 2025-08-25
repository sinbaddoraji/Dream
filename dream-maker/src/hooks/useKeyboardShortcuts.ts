import { useEffect } from 'react';
import { useDesignStore } from '../store/designStore';
import { FileService } from '../services/FileService';
import { ImageService } from '../services/ImageService';
import type { Tool } from '../store/designStore';

const keyToToolMap: Record<string, Tool> = {
  'v': 'select',
  'g': 'shapes',
  'p': 'pen',
  'b': 'brush',
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
    groups,
    // File operations
    newProject,
    loadProject,
    saveProject,
    hasUnsavedChanges,
    importImage,
    // View operations
    zoomIn,
    zoomOut,
    zoomToFit
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
          case 'n':
            event.preventDefault();
            if (hasUnsavedChanges) {
              // Show confirmation dialog - in a real app, this would trigger the same flow as menu
              if (confirm('You have unsaved changes. Creating a new project will lose these changes. Continue?')) {
                newProject();
              }
            } else {
              newProject();
            }
            return;
          case 'o':
            event.preventDefault();
            FileService.loadProjectFromFile()
              .then(projectData => loadProject(projectData))
              .catch(error => console.error('Failed to open project:', error));
            return;
          case 'i':
            event.preventDefault();
            ImageService.selectImageFile()
              .then(file => importImage(file))
              .catch(error => console.error('Failed to import image:', error));
            return;
          case 's':
            event.preventDefault();
            if (event.shiftKey) {
              // Ctrl+Shift+S - Save As
              const name = prompt('Enter project name:', 'Untitled Project');
              if (name && name.trim()) {
                try {
                  const state = useDesignStore.getState();
                  state.saveProjectAs(name.trim());
                } catch (error) {
                  console.error('Save As failed:', error);
                }
              }
            } else {
              // Ctrl+S - Save
              try {
                saveProject();
              } catch (error) {
                console.error('Save failed:', error);
              }
            }
            return;
          case '=':
          case '+':
            event.preventDefault();
            zoomIn();
            return;
          case '-':
            event.preventDefault();
            zoomOut();
            return;
          case '0':
            event.preventDefault();
            zoomToFit();
            return;
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
              // For now, skip nudging as it needs Konva implementation
              console.log('Nudging object:', obj.id, deltaX, deltaY);
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
    groups,
    newProject,
    loadProject,
    saveProject,
    hasUnsavedChanges,
    importImage,
    zoomIn,
    zoomOut,
    zoomToFit
  ]);
}