import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

interface NavigationPromptProps {
  open: boolean
  message: string
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
          bgcolor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          minWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ color: 'hsl(var(--foreground))' }}>
        페이지 이동 확인
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'hsl(var(--foreground))' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onCancel} 
          sx={{ 
            color: 'hsl(var(--muted-foreground))',
            '&:hover': {
              bgcolor: 'hsl(var(--accent) / 0.1)'
            }
          }}
        >
          취소
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          sx={{ 
            bgcolor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            '&:hover': {
              bgcolor: 'hsl(var(--primary) / 0.9)',
              color: 'hsl(var(--primary-foreground))'
            }
          }}
        >
          나가기
        </Button>
      </DialogActions>
    </Dialog>
  )
} 