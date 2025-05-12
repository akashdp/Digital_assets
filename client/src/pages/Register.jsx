import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { register, clearError } from '../store/slices/authSlice';
import '../styles/AuthForm.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [token, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Check passwords match only if both password fields have values
    if (name === 'confirmPassword' || name === 'password') {
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password !== newFormData.confirmPassword) {
          setPasswordError('Passwords do not match');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            letterSpacing: '1px',
            background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Digital Asset
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: '#fff',
            opacity: 0.9,
            fontWeight: 500
          }}>
            Secure Asset Management
          </Typography>
        </Toolbar>
      </AppBar>

      <div className="auth-bg">
        <div className="auth-form-container">
          <Typography component="h1" className="auth-form-title" gutterBottom>
            Sign Up
          </Typography>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
          {passwordError && (
            <Alert severity="error">
              {passwordError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="auth-form-button"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <div className="auth-form-link">
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Box>
  );
};

export default Register; 