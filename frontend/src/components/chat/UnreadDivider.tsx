import { Box, Divider, Typography } from '@mui/material';

interface UnreadDividerProps {
  count?: number;
}

export const UnreadDivider = ({ count }: UnreadDividerProps) => {
  const message = count && count > 1 ? `${count} New Messages` : 'New Messages';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        my: 2,
        position: 'relative',
      }}
    >
      <Divider sx={{ flex: 1, borderColor: 'primary.main', borderWidth: 1 }} />
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 0.5,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
        }}
      >
        {message}
      </Typography>
      <Divider sx={{ flex: 1, borderColor: 'primary.main', borderWidth: 1 }} />
    </Box>
  );
};
