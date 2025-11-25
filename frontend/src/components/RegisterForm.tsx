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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register as registerAction, clearError } from '../store/slices/authSlice';
import { PasswordStrength } from './PasswordStrength';

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());
    const { confirmPassword, ...registerData } = data;
    
    const result = await dispatch(registerAction(registerData));
    
    if (registerAction.fulfilled.match(result)) {
      onSuccess?.();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Create Account
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign up to start chatting
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
          />
        )}
      />

      <Controller
        name="username"
        control={control}
        rules={{
          required: 'Username is required',
          minLength: {
            value: 3,
            message: 'Username must be at least 3 characters',
          },
          maxLength: {
            value: 30,
            message: 'Username must not exceed 30 characters',
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Username"
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message}
            autoComplete="username"
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              fullWidth
              margin="normal"
              autoComplete="given-name"
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              fullWidth
              margin="normal"
              autoComplete="family-name"
            />
          )}
        />
      </Box>

      <Controller
        name="password"
        control={control}
        rules={{
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Password must contain uppercase, lowercase, and number',
          },
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
            autoComplete="new-password"
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

      <PasswordStrength password={password} />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin?.();
            }}
            sx={{ cursor: 'pointer' }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
