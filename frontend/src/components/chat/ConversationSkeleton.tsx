import { Box, Skeleton } from '@mui/material';

interface ConversationSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for conversation list items
 * Shows while conversations are loading
 */
export const ConversationSkeleton = ({ count = 5 }: ConversationSkeletonProps) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {/* Avatar skeleton */}
          <Skeleton variant="circular" width={48} height={48} />
          
          {/* Content skeleton */}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mt: 0.5 }} />
          </Box>
          
          {/* Timestamp skeleton */}
          <Skeleton variant="text" width={40} height={20} />
        </Box>
      ))}
    </Box>
  );
};
