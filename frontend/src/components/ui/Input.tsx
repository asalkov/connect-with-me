import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  helperText?: string;
  error?: boolean;
  success?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClear?: () => void;
}

const StyledTextField = styled(TextField)<{ success?: boolean }>(({ theme, error, success }) => ({
  '& .MuiOutlinedInput-root': {
    height: '44px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: error ? theme.palette.error.main : success ? theme.palette.success.main : '#E5E7EB',
      borderWidth: '2px',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: error ? theme.palette.error.main : success ? theme.palette.success.main : '#9CA3AF',
    },
    '&.Mui-focused': {
      backgroundColor: '#FAFBFF',
      transform: 'translateY(-1px)',
      '& fieldset': {
        borderColor: error ? theme.palette.error.main : success ? theme.palette.success.main : theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: error
          ? '0 0 0 4px rgba(239, 68, 68, 0.1), 0 4px 12px rgba(239, 68, 68, 0.15)'
          : success
          ? '0 0 0 4px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(16, 185, 129, 0.15)'
          : '0 0 0 4px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(37, 99, 235, 0.15)',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: '#F3F4F6',
      cursor: 'not-allowed',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    fontWeight: 500,
    '&.Mui-focused': {
      color: error ? theme.palette.error.main : success ? theme.palette.success.main : theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: error ? theme.palette.error.main : success ? theme.palette.success.main : '#6B7280',
  },
}));

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error = false,
  success = false,
  startIcon,
  endIcon,
  onClear,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const showClearButton = onClear && value && isFocused;

  return (
    <StyledTextField
      label={label}
      helperText={helperText}
      error={error}
      success={success}
      value={value}
      variant="outlined"
      fullWidth
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : undefined,
        endAdornment: showClearButton ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClear}
              edge="end"
              sx={{ width: '24px', height: '24px' }}
            >
              ✕
            </IconButton>
          </InputAdornment>
        ) : endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : undefined,
      }}
      {...props}
    />
  );
};

export default Input;
