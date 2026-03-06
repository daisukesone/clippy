import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useCleppy } from './CleppyContext';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  accent: string;
  accentDim: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  overlay: string;
}

const darkColors: ThemeColors = {
  background: '#0a0a1a',
  surface: '#16213e',
  surfaceAlt: '#1a1a3e',
  border: '#0f3460',
  accent: '#e94560',
  accentDim: 'rgba(233, 69, 96, 0.1)',
  text: '#fff',
  textSecondary: '#ddd',
  textMuted: '#888',
  danger: '#ff4444',
  overlay: 'rgba(0,0,0,0.6)',
};

const lightColors: ThemeColors = {
  background: '#f5f5f8',
  surface: '#ffffff',
  surfaceAlt: '#f0f0f5',
  border: '#e0e0e8',
  accent: '#e94560',
  accentDim: 'rgba(233, 69, 96, 0.08)',
  text: '#1a1a2e',
  textSecondary: '#333',
  textMuted: '#888',
  danger: '#dc3545',
  overlay: 'rgba(0,0,0,0.4)',
};

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useCleppy();
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (state.settings.theme === 'light') return false;
    if (state.settings.theme === 'dark') return true;
    return systemScheme !== 'light';
  }, [state.settings.theme, systemScheme]);

  const value = useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, isDark }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
