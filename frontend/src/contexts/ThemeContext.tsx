import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): ThemeMode => {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  // Save to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2563EB' : '#3B82F6',
            light: mode === 'light' ? '#3B82F6' : '#60A5FA',
            dark: mode === 'light' ? '#1E40AF' : '#2563EB',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: mode === 'light' ? '#6B7280' : '#9CA3AF',
            light: mode === 'light' ? '#9CA3AF' : '#D1D5DB',
            dark: mode === 'light' ? '#4B5563' : '#6B7280',
          },
          success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
          },
          warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
          },
          info: {
            main: mode === 'light' ? '#3B82F6' : '#60A5FA',
            light: mode === 'light' ? '#60A5FA' : '#93C5FD',
            dark: mode === 'light' ? '#2563EB' : '#3B82F6',
          },
          background: {
            default: mode === 'light' ? '#F9FAFB' : '#111827',
            paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
          },
          text: {
            primary: mode === 'light' ? '#111827' : '#F9FAFB',
            secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
            disabled: mode === 'light' ? '#9CA3AF' : '#6B7280',
          },
          divider: mode === 'light' ? '#E5E7EB' : '#374151',
        },
        typography: {
          fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Oxygen',
            'Ubuntu',
            'Cantarell',
            '"Helvetica Neue"',
            'sans-serif',
          ].join(','),
          h1: {
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: '40px',
            letterSpacing: '-0.02em',
          },
          h2: {
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: '32px',
            letterSpacing: '-0.01em',
          },
          h3: {
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            letterSpacing: '-0.01em',
          },
          h4: {
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '24px',
          },
          body1: {
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
          },
          body2: {
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
          },
          caption: {
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            letterSpacing: '0.01em',
            color: mode === 'light' ? '#6B7280' : '#9CA3AF',
          },
          button: {
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.01em',
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 8,
        },
        spacing: 8,
        shadows: [
          'none',
          mode === 'light'
            ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          mode === 'light'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          mode === 'light'
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          ...Array(20).fill(
            mode === 'light'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
          ),
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                lineHeight: '20px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': {
                  transform: 'scale(0.98)',
                },
              },
              contained: {
                boxShadow:
                  mode === 'light'
                    ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  boxShadow:
                    mode === 'light'
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover fieldset': {
                    borderColor: mode === 'light' ? '#9CA3AF' : '#6B7280',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'light' ? '#2563EB' : '#3B82F6',
                    borderWidth: '2px',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                boxShadow:
                  mode === 'light'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
        },
        transitions: {
          duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
          },
          easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
          },
        },
      }),
    [mode]
  );

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
