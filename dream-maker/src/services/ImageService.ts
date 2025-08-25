export class ImageService {
  static selectImageFile(): Promise<File> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
      };
      
      // Trigger file selection dialog
      input.click();
    });
  }

  static selectMultipleImageFiles(): Promise<FileList> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      
      input.onchange = (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('No files selected'));
        }
      };
      
      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
      };
      
      // Trigger file selection dialog
      input.click();
    });
  }

  static validateImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
}