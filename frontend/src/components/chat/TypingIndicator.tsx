import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

interface TypingIndicatorProps {
  userName?: string;
}

// Bouncing animation for dots
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`;

/**
 * Typing indicator component
 * Shows animated dots when user is typing
 * Matches design mockup from DESIGN_MOCKUPS.md Phase 3
 */
export const TypingIndicator = ({ userName = 'Someone' }: TypingIndicatorProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'grey.100',
          borderRadius: '18px 18px 18px 4px',
          px: 2,
          py: 1.5,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0s',
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0.2s',
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0.4s',
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
        {userName} is typing...
      </Typography>
    </Box>
  );
};
