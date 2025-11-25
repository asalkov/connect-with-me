import { Box, Typography, Paper, Button, Grid, Card, CardContent, Avatar, AvatarGroup } from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import { MainLayout } from '../components/layout';

export const GroupsPage = () => {
  return (
    <MainLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Groups
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create Group
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Group chat functionality will be implemented in Sprint 2.
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">Group {item}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Coming soon
                        </Typography>
                      </Box>
                    </Box>
                    <AvatarGroup max={4}>
                      <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
                      <Avatar sx={{ width: 32, height: 32 }}>B</Avatar>
                      <Avatar sx={{ width: 32, height: 32 }}>C</Avatar>
                    </AvatarGroup>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
};
