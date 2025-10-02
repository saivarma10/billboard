import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  Fade,
  Zoom,
  Chip,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Google,
  GitHub,
  ArrowForward,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../store/store'
import { login, clearError } from '../store/slices/authSlice'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      })
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await dispatch(login(formData)).unwrap()
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the slice
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        },
      }}
    >
      <Container component="main" maxWidth="sm">
        <Fade in timeout={800}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 35px 60px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
          <CardContent sx={{ p: 4 }}>
            <Zoom in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  <Business sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Sign in to your Billboard account
                </Typography>
                <Chip 
                  label="Secure Login" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                  }}
                />
              </Box>
            </Zoom>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                    },
                  },
                }}
              />
              
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                    },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#667eea',
                        '&.Mui-checked': {
                          color: '#667eea',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                    },
                  }}
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || isSubmitting}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                {loading || isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    Sign In
                    <ArrowForward sx={{ ml: 1, fontSize: 20 }} />
                  </>
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={() => handleSocialLogin('google')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#db4437',
                    color: '#db4437',
                    '&:hover': {
                      borderColor: '#c23321',
                      backgroundColor: 'rgba(219, 68, 55, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHub />}
                  onClick={() => handleSocialLogin('github')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#333',
                    color: '#333',
                    '&:hover': {
                      borderColor: '#000',
                      backgroundColor: 'rgba(51, 51, 51, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  GitHub
                </Button>
              </Box>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{
                    fontWeight: 600,
                    color: '#667eea',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create a new account
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Fade>
      </Container>
    </Box>
  )
}

export default LoginPage
