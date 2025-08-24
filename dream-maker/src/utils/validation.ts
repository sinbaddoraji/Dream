export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const ColorValidator = {
  isValid(color: string): boolean {
    // Check hex color format
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return true;
    }
    
    // Check rgb/rgba format
    if (/^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/i.test(color)) {
      return true;
    }
    
    // Check named colors
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 
      'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple',
      'brown', 'pink', 'lime', 'navy', 'teal', 'silver'
    ];
    
    return namedColors.includes(color.toLowerCase());
  },

  validate(color: string): string {
    if (!this.isValid(color)) {
      throw new ValidationError(`Invalid color format: ${color}`);
    }
    return color;
  },

  normalize(color: string): string {
    // Convert to hex format if possible
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    
    // For now, return as-is for other formats
    // In production, you'd want to convert all formats to a single format
    return color;
  }
};

export const NumberValidator = {
  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },

  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  validatePositive(value: number, name: string = 'Value'): number {
    if (value <= 0) {
      throw new ValidationError(`${name} must be positive`);
    }
    return value;
  },

  validateRange(value: number, min: number, max: number, name: string = 'Value'): number {
    if (!this.isInRange(value, min, max)) {
      throw new ValidationError(`${name} must be between ${min} and ${max}`);
    }
    return value;
  }
};

export const StringValidator = {
  isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  },

  validateNotEmpty(value: string, name: string = 'Value'): string {
    if (!this.isNotEmpty(value)) {
      throw new ValidationError(`${name} cannot be empty`);
    }
    return value;
  },

  validateMaxLength(value: string, maxLength: number, name: string = 'Value'): string {
    if (value.length > maxLength) {
      throw new ValidationError(`${name} cannot exceed ${maxLength} characters`);
    }
    return value;
  },

  sanitize(value: string): string {
    // Remove potentially harmful characters
    return value.replace(/[<>]/g, '');
  }
};

export const ToolValidator = {
  validateStrokeWidth(width: number): number {
    return NumberValidator.validateRange(width, 0.5, 100, 'Stroke width');
  },

  validateFontSize(size: number): number {
    return NumberValidator.validateRange(size, 8, 144, 'Font size');
  },

  validateOpacity(opacity: number): number {
    return NumberValidator.validateRange(opacity, 0, 1, 'Opacity');
  },

  validateZoom(zoom: number): number {
    return NumberValidator.validateRange(zoom, 0.1, 10, 'Zoom level');
  }
};