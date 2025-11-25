import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    const { rememberMe, ...loginData } = data;
    
    const result = await dispatch(login(loginData));
    
    if (login.fulfilled.match(result)) {
      onSuccess?.();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Welcome Back
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign in to continue chatting
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="emailOrUsername"
        control={control}
        rules={{
          required: 'Email or username is required',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email or Username"
            fullWidth
            margin="normal"
            error={!!errors.emailOrUsername}
            helperText={errors.emailOrUsername?.message}
            autoComplete="username"
            autoFocus
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: 'Password is required',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} color="primary" />}
              label="Remember me"
            />
          )}
        />
        <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister?.();
            }}
            sx={{ cursor: 'pointer' }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
