import React, { useState } from 'react';
import { Snackbar, Alert, Box, Typography, Button } from '@mui/material';
import { LogOut } from 'lucide-react';

export const SessionExpiredAlert = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      window.location.replace('/login');
    }, 500);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={handleClose}
      sx={{ mt: 6 }}
    >
      <Alert
        icon={<LogOut size={24} />}
        onClose={handleClose}
        severity="warning"
        variant="filled"
        sx={{ 
          minWidth: '300px',
          bgcolor: 'hsl(var(--warning))',
          color: 'hsl(var(--warning-foreground))',
          '& .MuiAlert-icon': {
            color: 'hsl(var(--warning-foreground))',
            opacity: 0.9
          },
          '& .MuiAlert-action': {
            pt: 0
          }
        }}
      >
        <Box>
          <Typography fontWeight={500} sx={{ mb: 0.5 }}>
            세션이 만료되었습니다
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            다시 로그인이 필요합니다
          </Typography>
          <Button 
            size="small"
            variant="outlined"
            onClick={handleClose}
            sx={{ 
              color: 'inherit',
              borderColor: 'currentColor',
              '&:hover': {
                borderColor: 'currentColor',
                bgcolor: 'hsl(var(--warning-foreground) / 0.1)'
              }
            }}
          >
            로그인하기
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
}; 