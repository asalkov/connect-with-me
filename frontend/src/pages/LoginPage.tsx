import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box } from '@mui/material';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/chat');
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={handleSwitchToRegister} />
        </Paper>
      </Box>
    </Container>
  );
};
