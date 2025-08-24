import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeName } from '../types/theme';
import { lightTheme, darkTheme, highContrastTheme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
  availableThemes: { name: ThemeName; displayName: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  highContrast: highContrastTheme,
  custom: lightTheme, // Default to light for custom
};

const availableThemes = [
  { name: 'light' as ThemeName, displayName: 'Light' },
  { name: 'dark' as ThemeName, displayName: 'Dark' },
  { name: 'highContrast' as ThemeName, displayName: 'High Contrast' },
];

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider = ({ children, defaultTheme = 'light' }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Try to load theme from localStorage
    const savedTheme = localStorage.getItem('dream-maker-theme') as ThemeName;
    return savedTheme && savedTheme in themes ? savedTheme : defaultTheme;
  });

  const theme = themes[themeName];

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('dream-maker-theme', themeName);
    
    // Apply CSS custom properties to root
    const root = document.documentElement;
    
    // Application colors
    root.style.setProperty('--bg-primary', theme.colors.background.primary);
    root.style.setProperty('--bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--bg-tertiary', theme.colors.background.tertiary);
    
    // Surface colors
    root.style.setProperty('--surface-primary', theme.colors.surface.primary);
    root.style.setProperty('--surface-secondary', theme.colors.surface.secondary);
    root.style.setProperty('--surface-elevated', theme.colors.surface.elevated);
    
    // Text colors
    root.style.setProperty('--text-primary', theme.colors.text.primary);
    root.style.setProperty('--text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--text-inverse', theme.colors.text.inverse);
    root.style.setProperty('--text-disabled', theme.colors.text.disabled);
    
    // Interactive colors
    root.style.setProperty('--interactive-primary', theme.colors.interactive.primary);
    root.style.setProperty('--interactive-primary-hover', theme.colors.interactive.primaryHover);
    root.style.setProperty('--interactive-secondary', theme.colors.interactive.secondary);
    root.style.setProperty('--interactive-secondary-hover', theme.colors.interactive.secondaryHover);
    root.style.setProperty('--interactive-accent', theme.colors.interactive.accent);
    root.style.setProperty('--interactive-accent-hover', theme.colors.interactive.accentHover);
    
    // Border colors
    root.style.setProperty('--border-primary', theme.colors.border.primary);
    root.style.setProperty('--border-secondary', theme.colors.border.secondary);
    root.style.setProperty('--border-focus', theme.colors.border.focus);
    
    // Canvas colors
    root.style.setProperty('--canvas-background', theme.colors.canvas.background);
    root.style.setProperty('--canvas-grid', theme.colors.canvas.grid);
    root.style.setProperty('--canvas-selection', theme.colors.canvas.selection);
    
    // Toolbar colors
    root.style.setProperty('--toolbar-background', theme.colors.toolbar.background);
    root.style.setProperty('--toolbar-button-active', theme.colors.toolbar.buttonActive);
    root.style.setProperty('--toolbar-button-hover', theme.colors.toolbar.buttonHover);
    root.style.setProperty('--toolbar-button-text', theme.colors.toolbar.buttonText);
    root.style.setProperty('--toolbar-button-text-active', theme.colors.toolbar.buttonTextActive);
    
    // Status colors
    root.style.setProperty('--status-success', theme.colors.status.success);
    root.style.setProperty('--status-warning', theme.colors.status.warning);
    root.style.setProperty('--status-error', theme.colors.status.error);
    root.style.setProperty('--status-info', theme.colors.status.info);
    
    // Shadows
    root.style.setProperty('--shadow-small', theme.shadows.small);
    root.style.setProperty('--shadow-medium', theme.shadows.medium);
    root.style.setProperty('--shadow-large', theme.shadows.large);
    root.style.setProperty('--shadow-canvas', theme.shadows.canvas);
    
    // Spacing
    root.style.setProperty('--spacing-xs', theme.spacing.xs);
    root.style.setProperty('--spacing-sm', theme.spacing.sm);
    root.style.setProperty('--spacing-md', theme.spacing.md);
    root.style.setProperty('--spacing-lg', theme.spacing.lg);
    root.style.setProperty('--spacing-xl', theme.spacing.xl);
    root.style.setProperty('--spacing-xxl', theme.spacing.xxl);
    
    // Border radius
    root.style.setProperty('--radius-sm', theme.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.borderRadius.lg);
    root.style.setProperty('--radius-full', theme.borderRadius.full);
    
  }, [theme]);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  const toggleTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.name === themeName);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex].name);
  };

  const value: ThemeContextType = {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};