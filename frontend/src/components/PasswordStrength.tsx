import { Box, LinearProgress, Typography } from '@mui/material';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
}

const calculatePasswordStrength = (password: string): StrengthResult => {
  let score = 0;

  if (!password) {
    return { score: 0, label: '', color: 'error' };
  }

  // Length
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;

  // Contains lowercase
  if (/[a-z]/.test(password)) score += 15;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 15;

  // Contains numbers
  if (/\d/.test(password)) score += 10;

  // Contains special characters
  if (/[^a-zA-Z\d]/.test(password)) score += 10;

  if (score < 40) {
    return { score, label: 'Weak', color: 'error' };
  } else if (score < 70) {
    return { score, label: 'Fair', color: 'warning' };
  } else if (score < 90) {
    return { score, label: 'Good', color: 'info' };
  } else {
    return { score, label: 'Strong', color: 'success' };
  }
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const strength = calculatePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={strength.score}
          color={strength.color}
          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color={`${strength.color}.main`} sx={{ minWidth: 50 }}>
          {strength.label}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Password strength: {strength.score}%
      </Typography>
    </Box>
  );
};
