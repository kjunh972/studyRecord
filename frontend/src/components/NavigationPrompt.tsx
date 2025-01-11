import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

interface NavigationPromptProps {
  open: boolean
  message: {
    title: string
    content: string
    confirmText: string
    cancelText?: string
  }
  onCancel: () => void
  onConfirm: () => void
}

export function NavigationPrompt({ open, message, onCancel, onConfirm }: NavigationPromptProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      PaperProps={{
        sx: {
          bgcolor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))'
        }
      }}
    >
      <DialogTitle>{message.title}</DialogTitle>
      <DialogContent>
        <Typography>
          {message.content}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {message.cancelText && (
          <Button onClick={onCancel}>
            {message.cancelText}
          </Button>
        )}
        <Button 
          onClick={onConfirm}
          variant="contained"
        >
          {message.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 