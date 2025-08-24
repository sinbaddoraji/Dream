import { createContext } from 'react';
import type { Theme, ThemeName } from '../types/theme';

export interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
  availableThemes: { name: ThemeName; displayName: string }[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);