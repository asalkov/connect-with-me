import React from 'react';
import { Box, Fade, Slide } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'none';
  direction?: 'up' | 'down' | 'left' | 'right';
  timeout?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  timeout = 300,
}) => {
  if (type === 'none') {
    return <>{children}</>;
  }

  if (type === 'slide') {
    return (
      <Slide direction={direction} in={true} timeout={timeout}>
        <Box>{children}</Box>
      </Slide>
    );
  }

  // Default to fade
  return (
    <Fade in={true} timeout={timeout}>
      <Box>{children}</Box>
    </Fade>
  );
};

export default PageTransition;
