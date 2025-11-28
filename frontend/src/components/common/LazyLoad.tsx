import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string | number;
}

const DefaultFallback = ({ minHeight }: { minHeight?: string | number }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: minHeight || '200px',
      width: '100%',
    }}
  >
    <CircularProgress />
  </Box>
);

const LazyLoad: React.FC<LazyLoadProps> = ({ children, fallback, minHeight }) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback minHeight={minHeight} />}>
      {children}
    </Suspense>
  );
};

export default LazyLoad;
