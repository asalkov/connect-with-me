import { Box, Tooltip } from '@mui/material';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

/**
 * Status indicator component
 * Shows colored dot for user status (online/offline/away/busy)
 * Matches design mockup from DESIGN_MOCKUPS.md Phase 3
 */
export const StatusIndicator = ({ 
  status, 
  size = 'medium', 
  showTooltip = true 
}: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#4ade80'; // Green
      case 'away':
        return '#fbbf24'; // Yellow
      case 'busy':
        return '#f87171'; // Red
      case 'offline':
      default:
        return '#9ca3af'; // Grey
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getSizeInPx = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      case 'medium':
      default:
        return 12;
    }
  };

  const indicator = (
    <Box
      sx={{
        width: getSizeInPx(),
        height: getSizeInPx(),
        borderRadius: '50%',
        bgcolor: getStatusColor(),
        border: '2px solid',
        borderColor: 'background.paper',
        boxShadow: 1,
      }}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={getStatusText()} arrow placement="top">
        {indicator}
      </Tooltip>
    );
  }

  return indicator;
};
