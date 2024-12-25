"use client"

import React from "react";
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from "@mui/material/styles";

export function ModeToggle() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        {theme.palette.mode === 'dark' ? <Moon /> : <Sun />}
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>
          {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
      </Menu>
    </>
  );
}

