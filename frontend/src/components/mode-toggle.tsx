"use client"

import React from "react";
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from "@mui/material/styles";

export function ModeToggle() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    handleClose();
  };

  React.useEffect(() => {
    // 초기 테마 설정
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          color: 'hsl(var(--foreground))',
          '&:hover': {
            backgroundColor: 'hsl(var(--accent) / 0.1)'
          }
        }}
      >
        {theme.palette.mode === 'dark' ? <Moon /> : <Sun />}
      </IconButton>
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--popover))',
            color: 'hsl(var(--popover-foreground))',
            border: '1px solid hsl(var(--border))',
            minWidth: '120px',
          }
        }}
      >
        <MenuItem 
          onClick={toggleTheme}
          sx={{
            '&:hover': {
              backgroundColor: 'hsl(var(--accent) / 0.1)'
            }
          }}
        >
          {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
      </Menu>
    </>
  );
}

