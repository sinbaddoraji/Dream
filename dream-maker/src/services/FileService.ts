import type { CanvasObject, ObjectGroup } from '../store/designStore';

export interface ProjectData {
  name: string;
  version: string;
  createdAt: string;
  modifiedAt: string;
  objects: Record<string, CanvasObject>;
  groups: Record<string, ObjectGroup>;
  settings: {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fontSize: number;
    fontFamily: string;
  };
}

export class FileService {
  private static readonly AUTO_SAVE_KEY = 'dream-maker-autosave';
  private static readonly VERSION = '1.0.0';

  static createProject(name: string = 'Untitled Project'): ProjectData {
    const now = new Date().toISOString();
    return {
      name,
      version: FileService.VERSION,
      createdAt: now,
      modifiedAt: now,
      objects: {},
      groups: {},
      settings: {
        fillColor: 'transparent',
        strokeColor: '#000000',
        strokeWidth: 2,
        fontSize: 16,
        fontFamily: 'Arial'
      }
    };
  }

  static serializeProject(data: {
    name?: string;
    objects: Record<string, CanvasObject>;
    groups: Record<string, ObjectGroup>;
    settings: {
      fillColor: string;
      strokeColor: string;
      strokeWidth: number;
      fontSize: number;
      fontFamily: string;
    };
    createdAt?: string;
  }): ProjectData {
    const now = new Date().toISOString();
    return {
      name: data.name || 'Untitled Project',
      version: FileService.VERSION,
      createdAt: data.createdAt || now,
      modifiedAt: now,
      objects: data.objects,
      groups: data.groups,
      settings: data.settings
    };
  }

  static saveProjectToFile(projectData: ProjectData): void {
    try {
      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.dream`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error('Failed to save project file');
    }
  }

  static loadProjectFromFile(): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.dream,.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const projectData = JSON.parse(content) as ProjectData;
            
            // Validate project data
            if (!FileService.validateProjectData(projectData)) {
              reject(new Error('Invalid project file format'));
              return;
            }
            
            resolve(projectData);
          } catch (error) {
            reject(new Error('Failed to parse project file'));
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  static saveToLocalStorage(projectData: ProjectData): void {
    try {
      localStorage.setItem(FileService.AUTO_SAVE_KEY, JSON.stringify(projectData));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  static loadFromLocalStorage(): ProjectData | null {
    try {
      const saved = localStorage.getItem(FileService.AUTO_SAVE_KEY);
      if (saved) {
        const projectData = JSON.parse(saved) as ProjectData;
        return FileService.validateProjectData(projectData) ? projectData : null;
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
    return null;
  }

  static exportAsImage(format: 'png' | 'jpg' = 'png', quality: number = 1): void {
    const stage = document.querySelector('canvas');
    if (!stage) {
      throw new Error('No canvas found for export');
    }

    try {
      const dataURL = stage.toDataURL(`image/${format}`, quality);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting image:', error);
      throw new Error('Failed to export image');
    }
  }

  static exportAsSVG(objects: Record<string, CanvasObject>): void {
    try {
      const svg = FileService.generateSVG(objects);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'export.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      throw new Error('Failed to export SVG');
    }
  }

  private static generateSVG(objects: Record<string, CanvasObject>): string {
    // Basic SVG generation - can be enhanced later
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">';
    
    Object.values(objects).forEach(obj => {
      // Note: This is a simplified SVG generation
      // Real implementation would need to convert Konva shapes to SVG elements
      if (obj.type === 'shape') {
        svg += '<!-- Shape objects would be converted to SVG elements -->';
      }
    });
    
    svg += '</svg>';
    return svg;
  }

  private static validateProjectData(data: any): data is ProjectData {
    return (
      data &&
      typeof data.name === 'string' &&
      typeof data.version === 'string' &&
      typeof data.createdAt === 'string' &&
      typeof data.modifiedAt === 'string' &&
      typeof data.objects === 'object' &&
      typeof data.groups === 'object' &&
      typeof data.settings === 'object' &&
      typeof data.settings.fillColor === 'string' &&
      typeof data.settings.strokeColor === 'string' &&
      typeof data.settings.strokeWidth === 'number' &&
      typeof data.settings.fontSize === 'number' &&
      typeof data.settings.fontFamily === 'string'
    );
  }

  static clearAutoSave(): void {
    try {
      localStorage.removeItem(FileService.AUTO_SAVE_KEY);
    } catch (error) {
      console.warn('Failed to clear auto-save:', error);
    }
  }
}