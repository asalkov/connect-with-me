import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface ChatLayoutProps {
  conversationList: ReactNode;
  messageView: ReactNode;
  showMessageView: boolean;
}

/**
 * ChatLayout component that implements the desktop/mobile split-view design
 * from DESIGN_MOCKUPS.md Phase 2
 * 
 * Desktop: Shows conversation list (360px) + message view side-by-side
 * Mobile: Shows either conversation list OR message view (full screen)
 */
export const ChatLayout = ({ conversationList, messageView, showMessageView }: ChatLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mobile: Show only one view at a time
  if (isMobile) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {showMessageView ? messageView : conversationList}
      </Box>
    );
  }

  // Desktop: Show split view
  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        gap: 0,
      }}
    >
      {/* Conversation List - Fixed width sidebar */}
      <Box
        sx={{
          width: '360px',
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {conversationList}
      </Box>

      {/* Message View - Flexible width */}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '800px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {messageView}
      </Box>
    </Box>
  );
};
