import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import Navbar from '../components/Navbar'
import './globals.css'
import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function RootLayout() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // 초기 테마 감지
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setMode(isDark ? 'dark' : 'light');

    // 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = root.classList.contains('dark');
          setMode(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(root, {
      attributes: true
    });

    return () => observer.disconnect();
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: '"Inter", sans-serif',
    },
    palette: {
      mode,
      background: {
        default: mode === 'light' ? 'hsl(0 0% 100%)' : 'hsl(240 10% 3.9%)',
        paper: mode === 'light' ? 'hsl(0 0% 100%)' : 'hsl(240 10% 3.9%)',
      },
      text: {
        primary: 'hsl(var(--foreground))',
        secondary: 'hsl(var(--muted-foreground))',
      },
      primary: {
        main: 'hsl(var(--primary))',
        contrastText: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        main: 'hsl(var(--secondary))',
        contrastText: 'hsl(var(--secondary-foreground))',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © 2024. kjunh972. All rights reserved.
        </footer>
      </div>
    </ThemeProvider>
  );
}


