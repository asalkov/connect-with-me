import { Box, Avatar as MuiAvatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Avatar } from './Avatar';

interface AvatarGroupProps {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactElement[];
}

const GroupContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const AvatarWrapper = styled(Box)<{ overlap: number }>(({ overlap }) => ({
  marginLeft: overlap,
  position: 'relative',
  '&:first-of-type': {
    marginLeft: 0,
  },
}));

const ExtraCountAvatar = styled(MuiAvatar)<{ avatarSize: number }>(({ avatarSize }) => ({
  width: avatarSize,
  height: avatarSize,
  fontSize: avatarSize * 0.35,
  fontWeight: 600,
  backgroundColor: '#E5E7EB',
  color: '#4B5563',
  border: '2px solid #FFFFFF',
}));

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 3,
  size = 'md',
  children,
}) => {
  const avatarSize = sizeMap[size];
  const overlap = -avatarSize * 0.2; // 20% overlap
  
  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childrenArray.slice(0, max);
  const extraCount = childrenArray.length - max;

  return (
    <GroupContainer>
      {visibleAvatars.map((child, index) => (
        <AvatarWrapper key={index} overlap={index === 0 ? 0 : overlap} sx={{ zIndex: visibleAvatars.length - index }}>
          {child}
        </AvatarWrapper>
      ))}
      {extraCount > 0 && (
        <AvatarWrapper overlap={overlap} sx={{ zIndex: 0 }}>
          <ExtraCountAvatar avatarSize={avatarSize}>
            +{extraCount}
          </ExtraCountAvatar>
        </AvatarWrapper>
      )}
    </GroupContainer>
  );
};

export default AvatarGroup;
