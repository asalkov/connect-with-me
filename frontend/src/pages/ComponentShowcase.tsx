import { useState } from 'react';
import { Box, Typography, Container, Divider, Grid } from '@mui/material';
import {
  Button,
  IconButton,
  Input,
  SearchInput,
  Avatar,
  AvatarGroup,
  MessageBubble,
  Card,
  Badge,
} from '../components/ui';

export const ComponentShowcase = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>
        Component Showcase
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Phase 1: Core Components from Design System
      </Typography>

      {/* Buttons */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Buttons
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="primary" loading>
            Loading...
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <IconButton>🔍</IconButton>
          <IconButton variant="primary">➕</IconButton>
          <IconButton variant="ghost">⋮</IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Inputs */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Input Fields
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClear={() => setInputValue('')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              helperText="Must be at least 8 characters"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input
              label="Error State"
              error
              helperText="This field is required"
              value="invalid@"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input
              label="Success State"
              success
              helperText="Email is available"
              value="valid@example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <SearchInput
              placeholder="Search conversations..."
              value={searchValue}
              onChange={setSearchValue}
              onClear={() => setSearchValue('')}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Avatars */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Avatars
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3 }}>
          <Avatar size="xs" alt="John Doe" />
          <Avatar size="sm" alt="Jane Smith" />
          <Avatar size="md" alt="Mike Johnson" showStatus status="online" />
          <Avatar size="lg" alt="Sarah Wilson" showStatus status="away" />
          <Avatar size="xl" alt="Alex Brown" showStatus status="busy" />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Avatar Group
          </Typography>
          <AvatarGroup max={3} size="md">
            <Avatar alt="User 1" />
            <Avatar alt="User 2" />
            <Avatar alt="User 3" />
            <Avatar alt="User 4" />
            <Avatar alt="User 5" />
          </AvatarGroup>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Message Bubbles */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Message Bubbles
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
          <MessageBubble
            variant="sent"
            content="Hey! How are you doing?"
            timestamp="10:30 AM"
            status="read"
          />
          <MessageBubble
            variant="received"
            content="I'm doing great! Thanks for asking. How about you?"
            timestamp="10:31 AM"
            sender="Sarah Johnson"
          />
          <MessageBubble
            variant="sent"
            content="That's awesome! 🎉"
            timestamp="10:32 AM"
            status="delivered"
            reactions={[
              { emoji: '👍', count: 3 },
              { emoji: '❤️', count: 1 },
            ]}
          />
          <MessageBubble
            variant="received"
            content="Let me know if you need anything!"
            timestamp="10:33 AM"
            sender="Sarah Johnson"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Cards */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Cards
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation="sm" sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Small Elevation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This card has a small shadow elevation.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation="md" sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Medium Elevation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This card has a medium shadow elevation.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation="lg" hover sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Hover Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hover over this card to see the effect.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card glass hover sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Glass Card ✨
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modern glassmorphism effect with blur.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Badges */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Badges
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Badge variant="count" count={5}>
            <Avatar alt="User" size="md" />
          </Badge>
          <Badge variant="count" count={99}>
            <Avatar alt="User" size="md" />
          </Badge>
          <Badge variant="count" count={100}>
            <Avatar alt="User" size="md" />
          </Badge>
          <Badge variant="dot">
            <Avatar alt="User" size="md" />
          </Badge>
          <Badge variant="status" status="online">
            <Avatar alt="User" size="md" />
          </Badge>
        </Box>
      </Box>
    </Container>
  );
};

export default ComponentShowcase;
