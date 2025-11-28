import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon, Error as ErrorIcon } from '@mui/icons-material';

export type ConfirmDialogSeverity = 'warning' | 'error' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  severity?: ConfirmDialogSeverity;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog component
 * Matches design mockup from DESIGN_MOCKUPS.md Phase 3
 */
export const ConfirmDialog = ({
  open,
  title,
  message,
  severity = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />;
      case 'warning':
      default:
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'info':
        return 'primary';
      case 'warning':
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={getConfirmButtonColor()}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
