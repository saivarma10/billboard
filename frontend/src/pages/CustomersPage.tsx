import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  Fade,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerStats,
  clearError,
} from '../store/slices/customerSlice'
import { fetchShops, setCurrentShop } from '../store/slices/shopSlice'

interface CustomerFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  tax_number: string
  notes: string
  is_active: boolean
}

interface FilterState {
  search: string
  isActive: boolean | null
  city: string
}

const CustomersPage: React.FC = () => {
  const dispatch = useDispatch()
  const { customers, stats, loading, error } = useSelector((state: RootState) => state.customer)
  const { currentShop, shops } = useSelector((state: RootState) => state.shop)

  // State for forms and UI
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [customerMenuAnchor, setCustomerMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)

  // Form data
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    tax_number: '',
    notes: '',
    is_active: true,
  })

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    isActive: null,
    city: '',
  })

  // Fetch shops and set current shop
  useEffect(() => {
    if (shops.length === 0) {
      dispatch(fetchShops() as any)
    }
  }, [dispatch, shops.length])

  useEffect(() => {
    if (!currentShop && shops.length > 0) {
      dispatch(setCurrentShop(shops[0]) as any)
    }
  }, [dispatch, currentShop, shops])

  // Fetch customers when shop is available
  useEffect(() => {
    if (currentShop?.id) {
      dispatch(fetchCustomers({ shopId: currentShop.id, filters }) as any)
      dispatch(fetchCustomerStats(currentShop.id) as any)
    }
  }, [dispatch, currentShop, filters])

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Handle create customer
  const handleCreateCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      tax_number: '',
      notes: '',
      is_active: true,
    })
    setCreateDialogOpen(true)
  }

  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      postal_code: customer.postal_code,
      tax_number: customer.tax_number,
      notes: customer.notes,
      is_active: customer.is_active,
    })
    setSelectedCustomer(customer)
    setEditDialogOpen(true)
  }

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer?.id || !currentShop?.id) return

    setIsSubmitting(true)
    try {
      const result = await dispatch(deleteCustomer({ shopId: currentShop.id, customerId: selectedCustomer.id }) as any)
      
      if (deleteCustomer.fulfilled.match(result)) {
        setSuccessMessage('Customer deleted successfully!')
        setShowSuccessSnackbar(true)
        setCustomerMenuAnchor(null)
        setSelectedCustomer(null)
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

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!formData.name.trim() || !currentShop?.id) {
      setSuccessMessage('Customer name is required')
      setShowSuccessSnackbar(true)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(createCustomer({ shopId: currentShop.id, customerData: formData }) as any)
      
      if (createCustomer.fulfilled.match(result)) {
        setSuccessMessage('Customer created successfully!')
        setShowSuccessSnackbar(true)
        setCreateDialogOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
          tax_number: '',
          notes: '',
          is_active: true,
        })
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

  // Handle edit form submission
  const handleEditFormSubmit = async () => {
    if (!formData.name.trim() || !selectedCustomer?.id || !currentShop?.id) {
      setSuccessMessage('Customer name is required')
      setShowSuccessSnackbar(true)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(updateCustomer({ shopId: currentShop.id, customerId: selectedCustomer.id, customerData: formData }) as any)
      
      if (updateCustomer.fulfilled.match(result)) {
        setSuccessMessage('Customer updated successfully!')
        setShowSuccessSnackbar(true)
        setEditDialogOpen(false)
        setSelectedCustomer(null)
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

  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: any) => {
    setCustomerMenuAnchor(event.currentTarget)
    setSelectedCustomer(customer)
  }

  const handleMenuClose = () => {
    setCustomerMenuAnchor(null)
    setSelectedCustomer(null)
  }

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Ensure customers is an array
  const customersArray = Array.isArray(customers) ? customers : []

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Customer Management
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
          Manage your customers efficiently and build lasting relationships.
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937">
                  {stats.total_customers}
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Total Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ 
        mb: 3, 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search customers..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading customers...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {customersArray.length > 0 ? customersArray.map((customer, index) => (
            <Grid item xs={12} sm={6} md={4} key={customer.id}>
              <Fade in timeout={index * 100}>
                <Card sx={{ 
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {customer.name}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, customer)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    {customer.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                        <Typography variant="body2" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    )}
                    
                    {customer.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#6b7280' }} />
                        <Typography variant="body2" color="text.secondary">
                          {customer.phone}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip 
                        label={customer.is_active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={customer.is_active ? 'success' : 'default'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )) : (
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
                <PersonIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="white">
                  No Customers Found
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
                  Create your first customer to get started.
        </Typography>
        <Button
          variant="contained"
                  onClick={handleCreateCustomer}
          startIcon={<AddIcon />}
                  sx={{ borderRadius: 2 }}
        >
                  Create Your First Customer
        </Button>
      </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
                label="Tax Number"
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Customer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Create Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
                label="Tax Number"
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Customer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditFormSubmit} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Update Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Menu */}
      <Menu
        anchorEl={customerMenuAnchor}
        open={Boolean(customerMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleEditCustomer(selectedCustomer); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Customer
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteCustomer(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Customer
        </MenuItem>
      </Menu>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccessSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add customer"
        onClick={handleCreateCustomer}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}

export default CustomersPage