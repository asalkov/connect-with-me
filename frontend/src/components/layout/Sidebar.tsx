import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import { 
  Chat as ChatIcon, 
  Group as GroupIcon, 
  Person as PersonIcon, 
  Settings as SettingsIcon,
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  drawerWidth: number;
}

interface NavItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

const navigationItems: NavItem[] = [
  { text: 'Chats', icon: <ChatIcon />, path: '/chat' },
  { text: 'Groups', icon: <GroupIcon />, path: '/groups' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

const settingsItems: NavItem[] = [
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const Sidebar = ({ drawerWidth }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: '64px' }}>
        {/* Logo/Brand Section */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            Connect
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stay connected, always
          </Typography>
        </Box>

        <Divider />

        {/* Main Navigation */}
        <List sx={{ px: 2, py: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2 }} />

        {/* Settings Section */}
        <List sx={{ px: 2, py: 2 }}>
          {settingsItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
