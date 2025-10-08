import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Fade,
  Paper
} from '@mui/material'
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { fetchShops, createShop, updateShop, deleteShop, setCurrentShop } from '../store/slices/shopSlice'

interface ShopFormData {
  name: string
  address: string
  phone: string
  email: string
  gst_number: string
}

interface FormErrors {
  name?: string
  address?: string
  phone?: string
  email?: string
  gst_number?: string
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch()
  const { shops, currentShop, loading, error } = useSelector((state: RootState) => state.shop)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<any>(null)
  const [shopMenuAnchor, setShopMenuAnchor] = useState<null | HTMLElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormValid, setIsFormValid] = useState(false)
  
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    gst_number: ''
  })

  useEffect(() => {
    console.log('SettingsPage: Fetching shops...')
    dispatch(fetchShops() as any)
  }, [dispatch])

  useEffect(() => {
    console.log('SettingsPage: Shops state changed:', { shops, loading, error })
    console.log('SettingsPage: Shops type:', typeof shops, 'Is array:', Array.isArray(shops))
    if (shops && !Array.isArray(shops)) {
      console.error('SettingsPage: Shops is not an array:', shops)
    }
  }, [shops, loading, error])

  // Real-time form validation
  const validateField = (field: keyof ShopFormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Shop name is required'
        if (value.trim().length < 2) return 'Shop name must be at least 2 characters'
        if (value.trim().length > 100) return 'Shop name must be less than 100 characters'
        return undefined
      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) return 'Please enter a valid email address'
        }
        return undefined
      case 'phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number'
        }
        return undefined
      case 'gst_number':
        if (value && value.trim()) {
          if (value.length < 10) return 'GST number must be at least 10 characters'
        }
        return undefined
      default:
        return undefined
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Validate name (required)
    const nameError = validateField('name', formData.name)
    if (nameError) {
      errors.name = nameError
      isValid = false
    }

    // Validate email (optional but must be valid if provided)
    const emailError = validateField('email', formData.email)
    if (emailError) {
      errors.email = emailError
      isValid = false
    }

    // Validate phone (optional but must be valid if provided)
    const phoneError = validateField('phone', formData.phone)
    if (phoneError) {
      errors.phone = phoneError
      isValid = false
    }

    // Validate GST number (optional but must be valid if provided)
    const gstError = validateField('gst_number', formData.gst_number)
    if (gstError) {
      errors.gst_number = gstError
      isValid = false
    }

    setFormErrors(errors)
    setIsFormValid(isValid)
    return isValid
  }

  // Validate form whenever formData changes
  useEffect(() => {
    if (createDialogOpen || editDialogOpen) {
      validateForm()
    }
  }, [formData, createDialogOpen, editDialogOpen])

  const handleCreateShop = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      gst_number: ''
    })
    setFormErrors({})
    setIsFormValid(false)
    setCreateDialogOpen(true)
  }

  const handleEditShop = (shop: any) => {
    setFormData({
      name: shop.name,
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || '',
      gst_number: shop.gst_number || ''
    })
    setFormErrors({})
    setIsFormValid(false)
    setSelectedShop(shop)
    setEditDialogOpen(true)
  }

  const handleFormSubmit = async () => {
    // Use the new validation system
    if (!validateForm()) {
      setSuccessMessage('Please fix the form errors before submitting')
      setShowSuccessSnackbar(true)
      return
    }

    // Check for duplicate shop name in current shops
    if (shops && Array.isArray(shops)) {
      const duplicateShop = shops.find(shop => 
        shop.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      )
      if (duplicateShop) {
        setSuccessMessage('A shop with this name already exists')
        setShowSuccessSnackbar(true)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(createShop(formData) as any)
      
      if (createShop.fulfilled.match(result)) {
        setSuccessMessage('Shop created successfully!')
        setShowSuccessSnackbar(true)
        setCreateDialogOpen(false)
        // Reset form
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          gst_number: ''
        })
        setFormErrors({})
        setIsFormValid(false)
        dispatch(fetchShops() as any)
      } else {
        setSuccessMessage(`Error: ${result.payload}`)
        setShowSuccessSnackbar(true)
      }
    } catch (error) {
      setSuccessMessage(`Error: ${error}`)
      setShowSuccessSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFormSubmit = async () => {
    if (!selectedShop?.id) {
      setSuccessMessage('Shop ID is required')
      setShowSuccessSnackbar(true)
      return
    }

    // Use the new validation system
    if (!validateForm()) {
      setSuccessMessage('Please fix the form errors before submitting')
      setShowSuccessSnackbar(true)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(updateShop({ shopId: selectedShop.id, shopData: formData }) as any)
      
      if (updateShop.fulfilled.match(result)) {
        setSuccessMessage('Shop updated successfully!')
        setShowSuccessSnackbar(true)
        setEditDialogOpen(false)
        setFormErrors({})
        setIsFormValid(false)
        dispatch(fetchShops() as any)
      } else {
        setSuccessMessage(`Error: ${result.payload}`)
        setShowSuccessSnackbar(true)
      }
    } catch (error) {
      setSuccessMessage(`Error: ${error}`)
      setShowSuccessSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteShop = async (shopId: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        const result = await dispatch(deleteShop(shopId) as any)
        if (deleteShop.fulfilled.match(result)) {
          setSuccessMessage('Shop deleted successfully!')
          setShowSuccessSnackbar(true)
          dispatch(fetchShops() as any)
        }
      } catch (error) {
        setSuccessMessage(`Error: ${error}`)
        setShowSuccessSnackbar(true)
      }
    }
    setShopMenuAnchor(null)
  }

  const handleSetCurrentShop = (shop: any) => {
    dispatch(setCurrentShop(shop) as any)
    setSuccessMessage(`Switched to ${shop.name}`)
    setShowSuccessSnackbar(true)
    setShopMenuAnchor(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Shop Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateShop}
          sx={{ borderRadius: 2 }}
        >
          Create Shop
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading shops...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(() => {
            console.log('SettingsPage: Rendering shops:', { shops, isArray: Array.isArray(shops), length: shops?.length })
            
            // Ensure shops is an array
            const shopsArray = Array.isArray(shops) ? shops : []
            
            if (shopsArray.length > 0) {
              return shopsArray.map((shop) => (
                <Grid item xs={12} sm={6} md={4} key={shop.id}>
                  <Card sx={{ 
                    height: '100%',
                    position: 'relative',
                    background: currentShop?.id === shop.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: currentShop?.id === shop.id ? 'white' : 'inherit',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon />
                          <Typography variant="h6" fontWeight="bold">
                            {shop.name}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={(e) => {
                            setShopMenuAnchor(e.currentTarget)
                            setSelectedShop(shop)
                          }}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      {shop.address && (
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                          📍 {shop.address}
                        </Typography>
                      )}
                      
                      {shop.phone && (
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                          📞 {shop.phone}
                        </Typography>
                      )}
                      
                      {shop.email && (
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                          ✉️ {shop.email}
                        </Typography>
                      )}
                      
                      {currentShop?.id === shop.id && (
                        <Chip 
                          label="Current Shop" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            } else {
              return (
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '50vh',
                    textAlign: 'center',
                    p: 4
                  }}>
                    <Typography variant="h5" gutterBottom color="text.secondary">
                      No Shops Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first shop to get started.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleCreateShop}
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Create Your First Shop
                    </Button>
                  </Box>
                </Grid>
              )
            }
          })()}
        </Grid>
      )}

      {/* Create Shop Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          mx: -3,
          mt: -3,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <StoreIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Create New Shop
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Set up your business information to get started
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Fade in={true} timeout={500}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' }}>
              <Grid container spacing={3}>
                {/* Shop Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Shop Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={!!formErrors.name}
                    helperText={formErrors.name || 'Enter your shop or business name'}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon color={formErrors.name ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    error={!!formErrors.address}
                    helperText={formErrors.address || 'Enter your shop address (optional)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <LocationIcon color={formErrors.address ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Phone and Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone || 'Enter contact number (optional)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color={formErrors.phone ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!formErrors.email}
                    helperText={formErrors.email || 'Enter email address (optional)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color={formErrors.email ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* GST Number */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="GST Number"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                    error={!!formErrors.gst_number}
                    helperText={formErrors.gst_number || 'Enter GST registration number (optional)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon color={formErrors.gst_number ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)} 
            disabled={isSubmitting}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={isSubmitting || !isFormValid}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: isFormValid 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(0,0,0,0.12)',
              '&:hover': {
                background: isFormValid 
                  ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  : 'rgba(0,0,0,0.12)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? 'Creating Shop...' : 'Create Shop'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Shop</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shop Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GST Number"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditFormSubmit}
            disabled={isSubmitting}
            startIcon={<EditIcon />}
          >
            {isSubmitting ? 'Updating...' : 'Update Shop'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shop Menu */}
      <Menu
        anchorEl={shopMenuAnchor}
        open={Boolean(shopMenuAnchor)}
        onClose={() => setShopMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleSetCurrentShop(selectedShop)}>
          <BusinessIcon sx={{ mr: 1 }} />
          Set as Current
        </MenuItem>
        <MenuItem onClick={() => handleEditShop(selectedShop)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteShop(selectedShop?.id)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
      >
        <Alert onClose={() => setShowSuccessSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SettingsPage
