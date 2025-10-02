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
  MenuItem
} from '@mui/material'
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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

  const handleCreateShop = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      gst_number: ''
    })
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
    setSelectedShop(shop)
    setEditDialogOpen(true)
  }

  const handleFormSubmit = async () => {
    // Comprehensive validation
    if (!formData.name.trim()) {
      setSuccessMessage('Shop name is required')
      setShowSuccessSnackbar(true)
      return
    }

    if (formData.name.trim().length < 2) {
      setSuccessMessage('Shop name must be at least 2 characters')
      setShowSuccessSnackbar(true)
      return
    }

    if (formData.name.trim().length > 100) {
      setSuccessMessage('Shop name must be less than 100 characters')
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

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setSuccessMessage('Please enter a valid email address')
        setShowSuccessSnackbar(true)
        return
      }
    }

    // Validate phone format if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        setSuccessMessage('Please enter a valid phone number')
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
    if (!formData.name.trim() || !selectedShop?.id) {
      setSuccessMessage('Shop name is required')
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Shop</DialogTitle>
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
          <Button onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            startIcon={<AddIcon />}
          >
            {isSubmitting ? 'Creating...' : 'Create Shop'}
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
