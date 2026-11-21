import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function AuthPage() {
  const [formState, setFormState] = React.useState(0);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const { handleLogin, handleRegister } = React.useContext(AuthContext);

  const handleAuth = async () => {
    setError('');
    try {
      if (formState === 0) {
        const result = await handleLogin(username, password);
        setMessage(result);
        setOpen(true);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 15% 15%, #1e293b 0%, #0f172a 55%, #080d1a 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <CssBaseline />

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: '20px',
          bgcolor: 'rgba(30, 41, 59, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Brand Icon */}
        <Avatar sx={{
          mb: 1.5,
          bgcolor: 'transparent',
          background: 'linear-gradient(135deg, #FF9839 0%, #EA580C 100%)',
          boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
          width: 52,
          height: 52
        }}>
          <LockOutlinedIcon fontSize="medium" />
        </Avatar>

        {/* Title */}
        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px', textAlign: 'center' }}>
          <span style={{ color: '#FF9839' }}>Zoomora</span> Video Call
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, textAlign: 'center' }}>
          {formState === 0 ? 'Sign in to access your meetings & AI summaries' : 'Create an account for high-quality video calling'}
        </Typography>

        {/* Tabs Switcher */}
        <Box sx={{
          display: 'flex',
          width: '100%',
          bgcolor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          p: '4px',
          mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Button
            fullWidth
            onClick={() => setFormState(0)}
            sx={{
              py: 1,
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 'bold',
              color: formState === 0 ? '#ffffff' : '#94a3b8',
              background: formState === 0 ? 'linear-gradient(135deg, #FF9839 0%, #EA580C 100%)' : 'transparent',
              boxShadow: formState === 0 ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
              '&:hover': {
                bgcolor: formState === 0 ? undefined : 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Sign In
          </Button>

          <Button
            fullWidth
            onClick={() => setFormState(1)}
            sx={{
              py: 1,
              borderRadius: '9px',
              textTransform: 'none',
              fontWeight: 'bold',
              color: formState === 1 ? '#ffffff' : '#94a3b8',
              background: formState === 1 ? 'linear-gradient(135deg, #FF9839 0%, #EA580C 100%)' : 'transparent',
              boxShadow: formState === 1 ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
              '&:hover': {
                bgcolor: formState === 1 ? undefined : 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Sign Up
          </Button>
        </Box>

        {/* Form Fields */}
        <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
          {formState === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.6 }}>
                Full Name
              </Typography>
              <TextField
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saurabh Kumar"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.18)' },
                    '&:hover fieldset': { borderColor: '#FF9839' },
                    '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                  }
                }}
              />
            </Box>
          )}

          {/* Username */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.6 }}>
              Username
            </Typography>
            <TextField
              required
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. saurabh123"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.18)' },
                  '&:hover fieldset': { borderColor: '#FF9839' },
                  '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                }
              }}
            />
          </Box>

          {/* Password */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.6 }}>
              Password
            </Typography>
            <TextField
              required
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAuth();
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.18)' },
                  '&:hover fieldset': { borderColor: '#FF9839' },
                  '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                }
              }}
            />
          </Box>

          {error && (
            <Typography variant="body2" sx={{ color: '#f87171', bgcolor: 'rgba(239, 68, 68, 0.12)', p: 1.2, borderRadius: '8px', mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleAuth}
            sx={{
              py: 1.4,
              mt: 1,
              fontWeight: 'bold',
              fontSize: '1.05rem',
              borderRadius: '10px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #FF9839 0%, #EA580C 100%)',
              boxShadow: '0 4px 18px rgba(234, 88, 12, 0.45)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffa756 0%, #f97316 100%)'
              }
            }}
          >
            {formState === 0 ? 'Sign In' : 'Create Account'}
          </Button>

          <Button
            fullWidth
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mt: 2,
              color: '#94a3b8',
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </Box>
  );
}
