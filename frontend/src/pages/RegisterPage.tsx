import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box } from '@mui/material';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/chat');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchToLogin} />
        </Paper>
      </Box>
    </Container>
  );
};
