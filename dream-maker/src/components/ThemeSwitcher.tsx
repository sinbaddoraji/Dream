import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeName } from '../types/theme';

export function ThemeSwitcher() {
  const { theme, themeName, setTheme, availableThemes } = useTheme();

  const getThemeIcon = (name: string) => {
    switch (name) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'highContrast':
        return <Monitor size={16} />;
      default:
        return <Palette size={16} />;
    }
  };

  return (
    <div className="relative">
      <select
        value={themeName}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        className="
          appearance-none bg-transparent border-2 rounded-lg px-3 py-2 pr-8
          text-sm font-medium cursor-pointer transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-2
        "
        style={{
          backgroundColor: theme.colors.surface.primary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary,
        }}
      >
        {availableThemes.map((themeOption: { name: ThemeName; displayName: string }) => (
          <option key={themeOption.name} value={themeOption.name}>
            {themeOption.displayName}
          </option>
        ))}
      </select>
      
      <div 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
        style={{ color: theme.colors.text.secondary }}
      >
        {getThemeIcon(themeName)}
      </div>
    </div>
  );
}