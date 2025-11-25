import { Box, Typography, Paper, List, ListItem, ListItemText, Switch, Divider } from '@mui/material';
import { MainLayout } from '../components/layout';

export const SettingsPage = () => {
  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications for new messages"
              />
              <Switch disabled />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive email notifications for important updates"
              />
              <Switch disabled />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Sound"
                secondary="Play sound for new messages"
              />
              <Switch disabled />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Privacy
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Online Status"
                secondary="Show your online status to others"
              />
              <Switch disabled defaultChecked />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Read Receipts"
                secondary="Let others know when you've read their messages"
              />
              <Switch disabled defaultChecked />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Typing Indicators"
                secondary="Show when you're typing"
              />
              <Switch disabled defaultChecked />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Dark Mode"
                secondary="Switch to dark theme"
              />
              <Switch disabled />
            </ListItem>
          </List>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Settings functionality will be fully implemented in later sprints.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};
