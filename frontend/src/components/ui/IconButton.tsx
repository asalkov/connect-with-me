import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface IconButtonProps extends MuiIconButtonProps {
  variant?: 'default' | 'primary' | 'ghost';
}

const StyledIconButton = styled(MuiIconButton)<{ variant?: string }>(({ theme, variant }) => {
  const baseStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    transition: 'all 150ms ease',
    '&:active': {
      transform: 'scale(0.98)',
    },
  };

  if (variant === 'primary') {
    return {
      ...baseStyles,
      backgroundColor: theme.palette.primary.main,
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
      },
    };
  }

  if (variant === 'ghost') {
    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: '#F3F4F6',
      },
    };
  }

  // Default variant
  return {
    ...baseStyles,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: '#F3F4F6',
    },
    '&:active': {
      backgroundColor: '#E5E7EB',
    },
  };
});

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <StyledIconButton variant={variant} {...props}>
      {children}
    </StyledIconButton>
  );
};

export default IconButton;
