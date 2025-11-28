import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface BadgeProps extends Omit<MuiBadgeProps, 'variant'> {
  variant?: 'count' | 'dot' | 'status';
  status?: 'online' | 'away' | 'busy' | 'offline';
  count?: number;
}

const statusColors = {
  online: '#10B981',
  away: '#F59E0B',
  busy: '#EF4444',
  offline: '#9CA3AF',
};

const CountBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
    height: '20px',
    minWidth: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.8,
      },
    },
  },
}));

const DotBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    minWidth: 'unset',
  },
}));

const StatusBadge = styled(MuiBadge)<{ statuscolor: string }>(({ statuscolor }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: statuscolor,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    minWidth: 'unset',
    boxShadow: `0 0 0 2px ${statuscolor}40`,
    animation: statuscolor === '#10B981' ? 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
    '@keyframes ping': {
      '75%, 100%': {
        transform: 'scale(1.5)',
        opacity: 0,
      },
    },
  },
}));

export const Badge: React.FC<BadgeProps> = ({
  variant = 'count',
  status = 'online',
  count = 0,
  children,
  ...props
}) => {
  if (variant === 'dot') {
    return (
      <DotBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        variant="dot"
        {...props}
      >
        {children}
      </DotBadge>
    );
  }

  if (variant === 'status') {
    return (
      <StatusBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        statuscolor={statusColors[status]}
        {...props}
      >
        {children}
      </StatusBadge>
    );
  }

  // Count badge (default)
  return (
    <CountBadge
      badgeContent={count}
      max={99}
      overlap="circular"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      {...props}
    >
      {children}
    </CountBadge>
  );
};

export default Badge;
