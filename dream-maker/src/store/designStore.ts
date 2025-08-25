import { create } from 'zustand';
import { FileService, type ProjectData } from '../services/FileService';
import type { DrawAction } from '../types/history';

export type Tool = 
  | 'select' 
  | 'shapes'
  | 'rectangle' 
  | 'ellipse' 
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'pentagon'
  | 'octagon'
  | 'line' 
  | 'pen' 
  | 'brush'
  | 'eraser'
  | 'text' 
  | 'crop'
  | 'eyedropper' 
  | 'zoom' 
  | 'hand';

export interface ToolConfig {
  id: Tool;
  label: string;
  shortcut: string;
  group: 'tools';
}

export interface CanvasObject {
  id: string;
  konvaNode?: any; // Will store Konva node reference
  type: 'shape' | 'text' | 'path' | 'group' | 'image';
  locked: boolean;
  visible: boolean;
  name?: string;
  parentGroup?: string;
  // Image-specific properties
  imageSrc?: string;
  imageData?: string; // Base64 data URL
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface ObjectGroup {
  id: string;
  name: string;
  objectIds: string[];
  locked: boolean;
  visible: boolean;
}

export interface SelectionState {
  selectedIds: string[];
  isSelecting: boolean;
  selectionBounds?: any;
  transformMode: 'move' | 'resize' | 'rotate' | null;
}

interface DesignStore {
  // Project metadata
  projectName: string;
  hasUnsavedChanges: boolean;
  lastSaved: string | null;
  
  // Canvas view state
  canvasScale: number;
  canvasX: number;
  canvasY: number;
  
  // Tools
  activeTool: Tool;
  selectedShape: Tool;
  
  // Colors and styling
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  
  // Objects and selection
  objects: Record<string, CanvasObject>;
  groups: Record<string, ObjectGroup>;
  selection: SelectionState;
  
  // History
  history: DrawAction[];
  historyIndex: number;
  setHistory: (history: DrawAction[]) => void;
  setHistoryIndex: (index: number) => void;
  
  // Project actions
  newProject: (name?: string) => void;
  loadProject: (projectData: ProjectData) => void;
  saveProject: () => void;
  saveProjectAs: (name: string) => void;
  exportProject: (format: 'png' | 'jpg' | 'svg' | 'json') => void;
  setProjectName: (name: string) => void;
  markUnsavedChanges: () => void;
  markSaved: () => void;
  
  // Canvas view actions
  setCanvasScale: (scale: number) => void;
  setCanvasPosition: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  
  // Actions
  setActiveTool: (tool: Tool) => void;
  setSelectedShape: (shape: Tool) => void;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  
  // Object management
  addObject: (object: CanvasObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  getObject: (id: string) => CanvasObject | undefined;
  
  // Selection management
  selectObjects: (ids: string[]) => void;
  addToSelection: (ids: string[]) => void;
  removeFromSelection: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  getSelectedObjects: () => CanvasObject[];
  
  // Group management
  createGroup: (name?: string) => string | null;
  ungroupObjects: (groupId: string) => void;
  addToGroup: (groupId: string, objectIds: string[]) => void;
  removeFromGroup: (groupId: string, objectIds: string[]) => void;
  
  // Object operations
  lockObjects: (ids: string[]) => void;
  unlockObjects: (ids: string[]) => void;
  hideObjects: (ids: string[]) => void;
  showObjects: (ids: string[]) => void;
  deleteObjects: (ids: string[]) => void;
  duplicateObjects: (ids: string[]) => string[];
  
  // Z-order
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;
  bringForward: (ids: string[]) => void;
  sendBackward: (ids: string[]) => void;
  
  // Image operations
  importImage: (file: File) => Promise<string>;
  
  // Transform
  setTransformMode: (mode: 'move' | 'resize' | 'rotate' | null) => void;
  setSelectionBounds: (bounds?: any) => void;
  
  // Legacy compatibility
  selectedItems: any[];
  setSelectedItems: (items: any[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateObjectName = (type: string, objects: Record<string, CanvasObject>): string => {
  const typeNames: Record<string, string> = {
    'shape': 'Shape',
    'text': 'Text',
    'path': 'Path',
    'group': 'Group',
    'image': 'Image',
    'rect': 'Rectangle',
    'ellipse': 'Ellipse',
    'line': 'Line'
  };
  
  const baseName = typeNames[type] || 'Object';
  const existingCount = Object.values(objects).filter(obj => 
    (obj.name || '').startsWith(baseName)
  ).length;
  
  return `${baseName} ${existingCount + 1}`;
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  // Initial state
  projectName: 'Untitled Project',
  hasUnsavedChanges: false,
  lastSaved: null,
  canvasScale: 1,
  canvasX: 0,
  canvasY: 0,
  activeTool: 'select',
  selectedShape: 'rectangle',
  fillColor: 'transparent',
  strokeColor: '#000000',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Arial',
  objects: {},
  groups: {},
  selection: {
    selectedIds: [],
    isSelecting: false,
    transformMode: null,
  },
  history: [],
  historyIndex: -1,
  selectedItems: [], // Legacy compatibility
  
  // Basic setters
  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedShape: (shape) => set({ selectedShape: shape }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontFamily: (family) => set({ fontFamily: family }),
  
  // Object management
  addObject: (object) => set((state) => {
    // Generate a name if none provided
    const objectWithName = {
      ...object,
      name: object.name || generateObjectName(object.type, state.objects)
    };
    
    return {
      objects: { ...state.objects, [object.id]: objectWithName },
      hasUnsavedChanges: true
    };
  }),
  
  removeObject: (id) => set((state) => {
    const remaining = Object.fromEntries(
      Object.entries(state.objects).filter(([key]) => key !== id)
    );
    return { objects: remaining, hasUnsavedChanges: true };
  }),
  
  updateObject: (id, updates) => set((state) => ({
    objects: {
      ...state.objects,
      [id]: { ...state.objects[id], ...updates }
    },
    hasUnsavedChanges: true
  })),
  
  getObject: (id) => get().objects[id],
  
  // Selection management
  selectObjects: (ids) => set((state) => {
    const validIds = ids.filter(id => state.objects[id] && !state.objects[id].locked);
    return {
      selection: { ...state.selection, selectedIds: validIds },
      selectedItems: validIds.map(id => state.objects[id]?.konvaNode).filter(Boolean) // Legacy compatibility
    };
  }),
  
  addToSelection: (ids) => set((state) => {
    const validIds = ids.filter(id => state.objects[id] && !state.objects[id].locked);
    const newSelection = [...new Set([...state.selection.selectedIds, ...validIds])];
    return {
      selection: { ...state.selection, selectedIds: newSelection },
      selectedItems: newSelection.map(id => state.objects[id]?.konvaNode).filter(Boolean) // Legacy compatibility
    };
  }),
  
  removeFromSelection: (ids) => set((state) => {
    const newSelection = state.selection.selectedIds.filter(id => !ids.includes(id));
    return {
      selection: { ...state.selection, selectedIds: newSelection },
      selectedItems: newSelection.map(id => state.objects[id]?.konvaNode).filter(Boolean) // Legacy compatibility
    };
  }),
  
  clearSelection: () => set((state) => ({
    selection: { ...state.selection, selectedIds: [] },
    selectedItems: [] // Legacy compatibility
  })),
  
  selectAll: () => set((state) => {
    const allUnlockedIds = Object.keys(state.objects).filter(id => !state.objects[id].locked);
    return {
      selection: { ...state.selection, selectedIds: allUnlockedIds },
      selectedItems: allUnlockedIds.map(id => state.objects[id]?.konvaNode).filter(Boolean) // Legacy compatibility
    };
  }),
  
  getSelectedObjects: () => {
    const state = get();
    return state.selection.selectedIds.map(id => state.objects[id]).filter(Boolean);
  },
  
  // Group management
  createGroup: (name = 'Group') => {
    const state = get();
    if (state.selection.selectedIds.length < 2) return null;
    
    const groupId = generateId();
    const group: ObjectGroup = {
      id: groupId,
      name: `${name} ${Object.keys(state.groups).length + 1}`,
      objectIds: [...state.selection.selectedIds],
      locked: false,
      visible: true
    };
    
    set((state) => ({
      groups: { ...state.groups, [groupId]: group },
      objects: Object.fromEntries(
        Object.entries(state.objects).map(([id, obj]) => [
          id,
          state.selection.selectedIds.includes(id) 
            ? { ...obj, parentGroup: groupId }
            : obj
        ])
      )
    }));
    
    return groupId;
  },
  
  ungroupObjects: (groupId) => set((state) => {
    const group = state.groups[groupId];
    if (!group) return state;
    
    const remainingGroups = Object.fromEntries(
      Object.entries(state.groups).filter(([key]) => key !== groupId)
    );
    const updatedObjects = Object.fromEntries(
      Object.entries(state.objects).map(([id, obj]) => [
        id,
        obj.parentGroup === groupId ? { ...obj, parentGroup: undefined } : obj
      ])
    );
    
    return { groups: remainingGroups, objects: updatedObjects };
  }),
  
  addToGroup: (groupId, objectIds) => set((state) => {
    const group = state.groups[groupId];
    if (!group) return state;
    
    return {
      groups: {
        ...state.groups,
        [groupId]: { ...group, objectIds: [...new Set([...group.objectIds, ...objectIds])] }
      },
      objects: Object.fromEntries(
        Object.entries(state.objects).map(([id, obj]) => [
          id,
          objectIds.includes(id) ? { ...obj, parentGroup: groupId } : obj
        ])
      )
    };
  }),
  
  removeFromGroup: (groupId, objectIds) => set((state) => {
    const group = state.groups[groupId];
    if (!group) return state;
    
    const newObjectIds = group.objectIds.filter(id => !objectIds.includes(id));
    
    return {
      groups: newObjectIds.length > 1 
        ? { ...state.groups, [groupId]: { ...group, objectIds: newObjectIds } }
        : Object.fromEntries(Object.entries(state.groups).filter(([id]) => id !== groupId)),
      objects: Object.fromEntries(
        Object.entries(state.objects).map(([id, obj]) => [
          id,
          objectIds.includes(id) ? { ...obj, parentGroup: undefined } : obj
        ])
      )
    };
  }),
  
  // Object operations
  lockObjects: (ids) => set((state) => ({
    objects: Object.fromEntries(
      Object.entries(state.objects).map(([id, obj]) => [
        id,
        ids.includes(id) ? { ...obj, locked: true } : obj
      ])
    ),
    selection: { ...state.selection, selectedIds: state.selection.selectedIds.filter(id => !ids.includes(id)) }
  })),
  
  unlockObjects: (ids) => set((state) => ({
    objects: Object.fromEntries(
      Object.entries(state.objects).map(([id, obj]) => [
        id,
        ids.includes(id) ? { ...obj, locked: false } : obj
      ])
    )
  })),
  
  hideObjects: (ids) => set((state) => ({
    objects: Object.fromEntries(
      Object.entries(state.objects).map(([id, obj]) => [
        id,
        ids.includes(id) ? { ...obj, visible: false } : obj
      ])
    ),
    selection: { ...state.selection, selectedIds: state.selection.selectedIds.filter(id => !ids.includes(id)) }
  })),
  
  showObjects: (ids) => set((state) => ({
    objects: Object.fromEntries(
      Object.entries(state.objects).map(([id, obj]) => [
        id,
        ids.includes(id) ? { ...obj, visible: true } : obj
      ])
    )
  })),
  
  deleteObjects: (ids) => set((state) => {
    const remainingObjects = Object.fromEntries(
      Object.entries(state.objects).filter(([id]) => !ids.includes(id))
    );
    
    // Remove objects from their Konva nodes if they exist
    ids.forEach(id => {
      const obj = state.objects[id];
      if (obj?.konvaNode) {
        obj.konvaNode.destroy();
      }
    });
    
    return {
      objects: remainingObjects,
      selection: { ...state.selection, selectedIds: state.selection.selectedIds.filter(id => !ids.includes(id)) }
    };
  }),
  
  duplicateObjects: (ids) => {
    const state = get();
    const newIds: string[] = [];
    
    ids.forEach(id => {
      const obj = state.objects[id];
      if (obj?.konvaNode) {
        const newId = generateId();
        // Note: Konva node cloning would need to be handled in the canvas component
        
        const newObj: CanvasObject = {
          ...obj,
          id: newId,
          name: `${obj.name || 'Object'} Copy`
        };
        
        get().addObject(newObj);
        newIds.push(newId);
      }
    });
    
    return newIds;
  },
  
  // Z-order operations (will need to be implemented in Konva canvas)
  bringToFront: (ids) => {
    ids.forEach(id => {
      const obj = get().objects[id];
      if (obj?.konvaNode) {
        obj.konvaNode.moveToTop();
      }
    });
  },
  
  sendToBack: (ids) => {
    ids.forEach(id => {
      const obj = get().objects[id];
      if (obj?.konvaNode) {
        obj.konvaNode.moveToBottom();
      }
    });
  },
  
  bringForward: (ids) => {
    ids.forEach(id => {
      const obj = get().objects[id];
      if (obj?.konvaNode) {
        obj.konvaNode.moveUp();
      }
    });
  },
  
  sendBackward: (ids) => {
    ids.forEach(id => {
      const obj = get().objects[id];
      if (obj?.konvaNode) {
        obj.konvaNode.moveDown();
      }
    });
  },
  
  // Transform
  setTransformMode: (mode) => set((state) => ({
    selection: { ...state.selection, transformMode: mode }
  })),
  
  setSelectionBounds: (bounds) => set((state) => ({
    selection: { ...state.selection, selectionBounds: bounds }
  })),
  
  // Legacy compatibility
  setSelectedItems: (items) => set({ selectedItems: items }),
  
  // Project management
  newProject: (name = 'Untitled Project') => {
    set({
      projectName: name,
      hasUnsavedChanges: false,
      lastSaved: null,
      canvasScale: 1,
      canvasX: 0,
      canvasY: 0,
      objects: {},
      groups: {},
      selection: {
        selectedIds: [],
        isSelecting: false,
        transformMode: null,
      },
      selectedItems: [],
      history: [],
      historyIndex: -1,
      fillColor: 'transparent',
      strokeColor: '#000000',
      strokeWidth: 2,
      fontSize: 16,
      fontFamily: 'Arial',
    });
    FileService.clearAutoSave();
  },

  loadProject: (projectData: ProjectData) => {
    set({
      projectName: projectData.name,
      hasUnsavedChanges: false,
      lastSaved: projectData.modifiedAt,
      objects: projectData.objects,
      groups: projectData.groups,
      fillColor: projectData.settings.fillColor,
      strokeColor: projectData.settings.strokeColor,
      strokeWidth: projectData.settings.strokeWidth,
      fontSize: projectData.settings.fontSize,
      fontFamily: projectData.settings.fontFamily,
      selection: {
        selectedIds: [],
        isSelecting: false,
        transformMode: null,
      },
      selectedItems: [],
      history: [],
      historyIndex: -1,
    });
  },

  saveProject: () => {
    const state = get();
    const projectData = FileService.serializeProject({
      name: state.projectName,
      objects: state.objects,
      groups: state.groups,
      settings: {
        fillColor: state.fillColor,
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
      },
      createdAt: state.lastSaved || undefined,
    });
    
    try {
      FileService.saveProjectToFile(projectData);
      FileService.saveToLocalStorage(projectData);
      set({ 
        hasUnsavedChanges: false, 
        lastSaved: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  },

  saveProjectAs: (name: string) => {
    set({ projectName: name });
    get().saveProject();
  },

  exportProject: (format: 'png' | 'jpg' | 'svg' | 'json') => {
    const state = get();
    
    try {
      switch (format) {
        case 'png':
        case 'jpg':
          FileService.exportAsImage(format);
          break;
        case 'svg':
          FileService.exportAsSVG(state.objects);
          break;
        case 'json':
          const projectData = FileService.serializeProject({
            name: state.projectName,
            objects: state.objects,
            groups: state.groups,
            settings: {
              fillColor: state.fillColor,
              strokeColor: state.strokeColor,
              strokeWidth: state.strokeWidth,
              fontSize: state.fontSize,
              fontFamily: state.fontFamily,
            },
            createdAt: state.lastSaved || undefined,
          });
          FileService.saveProjectToFile(projectData);
          break;
      }
    } catch (error) {
      console.error('Failed to export project:', error);
      throw error;
    }
  },

  setProjectName: (name: string) => set({ projectName: name }),
  
  markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
  
  markSaved: () => set({ 
    hasUnsavedChanges: false, 
    lastSaved: new Date().toISOString() 
  }),
  
  // Canvas view management
  setCanvasScale: (scale: number) => set({ 
    canvasScale: Math.max(0.1, Math.min(5, scale)) // Limit scale between 0.1x and 5x
  }),
  
  setCanvasPosition: (x: number, y: number) => set({ canvasX: x, canvasY: y }),
  
  zoomIn: () => set((state) => ({ 
    canvasScale: Math.min(5, state.canvasScale * 1.2) 
  })),
  
  zoomOut: () => set((state) => ({ 
    canvasScale: Math.max(0.1, state.canvasScale / 1.2) 
  })),
  
  zoomToFit: () => {
    // Reset to default view - could be enhanced to fit content
    set({ canvasScale: 1, canvasX: 0, canvasY: 0 });
  },
  
  resetView: () => set({ canvasScale: 1, canvasX: 0, canvasY: 0 }),
  
  // Image import
  importImage: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          reject(new Error('Failed to read image file'));
          return;
        }

        // Create an image element to get natural dimensions
        const img = new window.Image();
        img.onload = () => {
          const imageId = generateId();
          const imageObject: CanvasObject = {
            id: imageId,
            type: 'image',
            locked: false,
            visible: true,
            name: file.name,
            imageData: dataUrl,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };

          get().addObject(imageObject);
          resolve(imageId);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = dataUrl;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // History setters
  setHistory: (history: DrawAction[]) => set({ history }),
  setHistoryIndex: (historyIndex: number) => set({ historyIndex }),
}));