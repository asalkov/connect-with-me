import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

// Primary Button (Blue gradient, modern)
const PrimaryButton = styled(MuiButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, #60A5FA 100%)`,
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
  },
  '&:disabled': {
    background: '#D1D5DB',
    color: '#9CA3AF',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}));

// Secondary Button (Modern outlined with subtle effects)
const SecondaryButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#374151',
  border: '2px solid #E5E7EB',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    border: '2px solid #2563EB',
    color: '#2563EB',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  '&:disabled': {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
    border: '2px solid #E5E7EB',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}));

// Ghost Button (Minimal with smooth transitions)
const GhostButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    color: theme.palette.primary.main,
    transform: 'scale(1.02)',
  },
  '&:active': {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    transform: 'scale(0.98)',
  },
  '&:disabled': {
    color: '#9CA3AF',
    cursor: 'not-allowed',
  },
}));

// Danger Button (Red gradient with warning effects)
const DangerButton = styled(MuiButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
  color: '#FFFFFF',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, #FCA5A5 100%)`,
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  },
  '&:disabled': {
    background: '#D1D5DB',
    color: '#9CA3AF',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}));

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}) => {
  const ButtonComponent = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    ghost: GhostButton,
    danger: DangerButton,
  }[variant];

  return (
    <ButtonComponent
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
          {children}
        </>
      ) : (
        children
      )}
    </ButtonComponent>
  );
};

export default Button;
