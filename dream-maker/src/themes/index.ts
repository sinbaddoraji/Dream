import type { Theme } from '../types/theme';

export const lightTheme: Theme = {
  name: 'Light',
  colors: {
    background: {
      primary: '#f8fafc',
      secondary: '#f1f5f9',
      tertiary: '#e2e8f0',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      elevated: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      inverse: '#ffffff',
      disabled: '#94a3b8',
    },
    interactive: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#e2e8f0',
      secondaryHover: '#cbd5e1',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#3b82f6',
    },
    canvas: {
      background: '#ffffff',
      grid: '#f1f5f9',
      selection: '#3b82f6',
    },
    toolbar: {
      background: '#f1f5f9',
      buttonActive: '#3b82f6',
      buttonHover: '#e2e8f0',
      buttonText: '#475569',
      buttonTextActive: '#ffffff',
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  shadows: {
    small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    canvas: '0 8px 32px 0 rgb(0 0 0 / 0.12)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
};

export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    surface: {
      primary: '#1e293b',
      secondary: '#334155',
      elevated: '#475569',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      inverse: '#0f172a',
      disabled: '#64748b',
    },
    interactive: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#334155',
      secondaryHover: '#475569',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      focus: '#3b82f6',
    },
    canvas: {
      background: '#ffffff',
      grid: '#f1f5f9',
      selection: '#3b82f6',
    },
    toolbar: {
      background: '#1e293b',
      buttonActive: '#3b82f6',
      buttonHover: '#334155',
      buttonText: '#cbd5e1',
      buttonTextActive: '#ffffff',
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  shadows: {
    small: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
    canvas: '0 8px 32px 0 rgb(0 0 0 / 0.6)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
};

export const highContrastTheme: Theme = {
  name: 'High Contrast',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#333333',
    },
    surface: {
      primary: '#1a1a1a',
      secondary: '#333333',
      elevated: '#4d4d4d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e6e6e6',
      inverse: '#000000',
      disabled: '#999999',
    },
    interactive: {
      primary: '#0099ff',
      primaryHover: '#0077cc',
      secondary: '#333333',
      secondaryHover: '#4d4d4d',
      accent: '#ff6600',
      accentHover: '#cc5200',
    },
    border: {
      primary: '#666666',
      secondary: '#999999',
      focus: '#0099ff',
    },
    canvas: {
      background: '#ffffff',
      grid: '#f0f0f0',
      selection: '#0099ff',
    },
    toolbar: {
      background: '#1a1a1a',
      buttonActive: '#0099ff',
      buttonHover: '#333333',
      buttonText: '#ffffff',
      buttonTextActive: '#ffffff',
    },
    status: {
      success: '#00cc00',
      warning: '#ffcc00',
      error: '#ff3300',
      info: '#0099ff',
    },
  },
  shadows: {
    small: '0 1px 2px 0 rgb(255 255 255 / 0.1)',
    medium: '0 4px 6px -1px rgb(255 255 255 / 0.15), 0 2px 4px -2px rgb(255 255 255 / 0.15)',
    large: '0 10px 15px -3px rgb(255 255 255 / 0.2), 0 4px 6px -4px rgb(255 255 255 / 0.2)',
    canvas: '0 8px 32px 0 rgb(255 255 255 / 0.3)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
};