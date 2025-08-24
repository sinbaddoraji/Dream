export interface ThemeColors {
  // Application background
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // UI surfaces
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    disabled: string;
  };
  
  // Interactive elements
  interactive: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
  };
  
  // Borders and dividers
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  
  // Canvas specific
  canvas: {
    background: string;
    grid: string;
    selection: string;
  };
  
  // Toolbar specific
  toolbar: {
    background: string;
    buttonActive: string;
    buttonHover: string;
    buttonText: string;
    buttonTextActive: string;
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ThemeShadows {
  small: string;
  medium: string;
  large: string;
  canvas: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  shadows: ThemeShadows;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

export type ThemeName = 'light' | 'dark' | 'highContrast' | 'custom';