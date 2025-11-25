import { ReactNode, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppHeader 
        drawerWidth={drawerWidth} 
        onMenuClick={handleDrawerToggle}
        isMobile={isMobile}
      />
      
      {isMobile ? (
        <MobileDrawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          drawerWidth={drawerWidth}
        />
      ) : (
        <Sidebar drawerWidth={drawerWidth} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
