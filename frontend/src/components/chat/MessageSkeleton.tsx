import { Box, Skeleton } from '@mui/material';

interface MessageSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for message bubbles
 * Shows while messages are loading
 */
export const MessageSkeleton = ({ count = 8 }: MessageSkeletonProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {Array.from({ length: count }).map((_, index) => {
        const isOwn = index % 3 === 0; // Alternate between sent/received
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwn ? 'flex-end' : 'flex-start',
            }}
          >
            <Skeleton
              variant="rounded"
              width={Math.random() * 200 + 150} // Random width between 150-350px
              height={60}
              sx={{
                borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}
            />
            <Skeleton variant="text" width={60} height={16} sx={{ mt: 0.5 }} />
          </Box>
        );
      })}
    </Box>
  );
};
