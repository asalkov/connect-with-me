import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, IconButton } from '@mui/material';
import { 
  Chat as ChatIcon, 
  Group as GroupIcon, 
  Person as PersonIcon, 
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
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

export const MobileDrawer = ({ open, onClose, drawerWidth }: MobileDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        {/* Header with Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Connect
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Stay connected, always
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
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
