import { Avatar as MuiAvatar, Badge, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StatusType = 'online' | 'away' | 'busy' | 'offline';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: StatusType;
  showStatus?: boolean;
  children?: React.ReactNode;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const statusColors: Record<StatusType, string> = {
  online: '#10B981',  // Green
  away: '#F59E0B',    // Amber
  busy: '#EF4444',    // Red
  offline: '#9CA3AF', // Gray
};

const StyledAvatar = styled(MuiAvatar)<{ avatarSize: number }>(({ avatarSize }) => ({
  width: avatarSize,
  height: avatarSize,
  fontSize: avatarSize * 0.4,
  fontWeight: 600,
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  color: '#FFFFFF',
  border: '2px solid #FFFFFF',
  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
  },
}));

const StatusBadge = styled(Badge)<{ statuscolor: string; avatarSize: number }>(
  ({ statuscolor, avatarSize }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: statuscolor,
      width: avatarSize * 0.25,
      height: avatarSize * 0.25,
      borderRadius: '50%',
      border: '2px solid #FFFFFF',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
  })
);

const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  status,
  showStatus = false,
  children,
}) => {
  const avatarSize = sizeMap[size];
  const statusColor = status ? statusColors[status] : statusColors.offline;

  const avatarContent = (
    <StyledAvatar src={src} alt={alt} avatarSize={avatarSize}>
      {!src && (children || getInitials(alt))}
    </StyledAvatar>
  );

  if (showStatus && status) {
    return (
      <StatusBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        statuscolor={statusColor}
        avatarSize={avatarSize}
      >
        {avatarContent}
      </StatusBadge>
    );
  }

  return avatarContent;
};

export default Avatar;
