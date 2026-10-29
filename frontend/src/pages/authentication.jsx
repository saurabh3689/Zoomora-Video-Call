import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Paper,
  Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/AuthContext';

export default function AuthPage() {
  const [formState, setFormState] = React.useState(0);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

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
        setUsername('');
        setPassword('');
        setName('');
        setFormState(0);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <CssBaseline />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backgroundImage:
            'url(https://static.vecteezy.com/system/resources/previews/011/635/825/non_2x/abstract-square-interface-modern-background-concept-fingerprint-digital-scanning-visual-security-system-authentication-login-vector.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}
      />

      <Box
        component={Paper}
        elevation={6}
        sx={{
          maxWidth: 400,
          mx: 'auto',
          mt: 10,
          p: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Button
            variant={formState === 0 ? 'contained' : 'outlined'}
            onClick={() => setFormState(0)}
          >
            Sign In
          </Button>
          <Button
            variant={formState === 1 ? 'contained' : 'outlined'}
            onClick={() => setFormState(1)}
          >
            Sign Up
          </Button>
        </Box>

        <Box component="form" noValidate autoComplete="off">
          {formState === 1 && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAuth();
            }}
          />

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleAuth}
          >
            {formState === 0 ? 'Login' : 'Register'}
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
