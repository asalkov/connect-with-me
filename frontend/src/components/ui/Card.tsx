import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CardProps extends MuiCardProps {
  hover?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  glass?: boolean;
}

const elevationMap = {
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const StyledCard = styled(MuiCard)<{ hover?: boolean; customElevation?: string; glass?: boolean }>(
  ({ hover, customElevation, glass }) => ({
    borderRadius: '16px',
    border: glass ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(229, 231, 235, 0.8)',
    boxShadow: customElevation || elevationMap.md,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    ...(glass && {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
      opacity: 0.5,
    },
    ...(hover && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: 'translateY(-4px) scale(1.01)',
        border: glass ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, transparent 100%)',
          pointerEvents: 'none',
        },
      },
      '&:active': {
        transform: 'translateY(-2px) scale(1)',
      },
    }),
  })
);

export const Card: React.FC<CardProps> = ({
  hover = false,
  elevation = 'md',
  glass = false,
  children,
  ...props
}) => {
  return (
    <StyledCard hover={hover} customElevation={elevationMap[elevation]} glass={glass} {...props}>
      {children}
    </StyledCard>
  );
};

export default Card;
