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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Checkbox,
  Stack,
  Divider,
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
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [customerMenuAnchor, setCustomerMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)
  
  // Table state
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [sortBy] = useState('name')
  const [sortOrder] = useState<'asc' | 'desc'>('asc')

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

  // Sort and filter customers
  const sortedAndFilteredCustomers = customersArray
    .filter(customer => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return customer.name?.toLowerCase().includes(searchLower) ||
               customer.email?.toLowerCase().includes(searchLower) ||
               customer.phone?.includes(searchLower)
      }
      return true
    })
    .filter(customer => {
      if (filters.isActive !== null) {
        return customer.is_active === filters.isActive
      }
      return true
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        default:
          aValue = a.name || ''
          bValue = b.name || ''
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  // Handle table selection
  const handleSelectAll = () => {
    if (selectedCustomers.length === sortedAndFilteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(sortedAndFilteredCustomers.map(customer => customer.id))
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  // Handle view customer details
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      p: 3
    }}>
      {/* Modern Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          p: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          mb: 3,
        }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box sx={{
              p: 1.5,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PersonIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h4" fontWeight="600" sx={{ color: '#1f2937' }}>
              Customer Management
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1rem' }}>
            Manage your customers efficiently and build lasting relationships.
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderColor: '#3b82f6',
              },
              transition: 'all 0.2s ease'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                }}>
                  <PeopleIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h4" fontWeight="600" sx={{ color: '#1f2937', mb: 0.5 }}>
                  {stats.total_customers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: '500' }}>
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
        background: 'white',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      }}>
        <CardContent sx={{ p: 3 }}>
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
                      <SearchIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    }
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
        <>
          {sortedAndFilteredCustomers.length > 0 ? (
            <Card sx={{ 
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell padding="checkbox" sx={{ width: 50 }}>
                        <Checkbox
                          indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < sortedAndFilteredCustomers.length}
                          checked={selectedCustomers.length === sortedAndFilteredCustomers.length && sortedAndFilteredCustomers.length > 0}
                          onChange={handleSelectAll}
                          sx={{ color: '#64748b' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
                        Customer
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
                        Contact
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
                        Location
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#374151' }}>
                        Joined
                      </TableCell>
                      <TableCell sx={{ width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAndFilteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        hover 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer'
                          },
                          '&:last-child td': { borderBottom: 0 }
                        }}
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleSelectCustomer(customer.id)}
                            sx={{ color: '#64748b' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40,
                              backgroundColor: customer.is_active ? '#3b82f6' : '#6b7280',
                              fontSize: '1rem',
                              fontWeight: '600'
                            }}>
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600" sx={{ 
                                color: '#1f2937',
                                fontSize: '0.875rem',
                                mb: 0.5
                              }}>
                                {customer.name}
                              </Typography>
                              {customer.tax_number && (
                                <Typography variant="caption" sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.75rem'
                                }}>
                                  Tax: {customer.tax_number}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {customer.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 14, mr: 1, color: '#6b7280' }} />
                                <Typography variant="body2" sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.875rem'
                                }}>
                                  {customer.email}
                                </Typography>
                              </Box>
                            )}
                            {customer.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon sx={{ fontSize: 14, mr: 1, color: '#6b7280' }} />
                                <Typography variant="body2" sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.875rem'
                                }}>
                                  {customer.phone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {customer.city && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 14, mr: 1, color: '#6b7280' }} />
                                <Typography variant="body2" sx={{ 
                                  color: '#6b7280',
                                  fontSize: '0.875rem'
                                }}>
                                  {customer.city}
                                  {customer.state && `, ${customer.state}`}
                                </Typography>
                              </Box>
                            )}
                            {customer.country && (
                              <Typography variant="caption" sx={{ 
                                color: '#9ca3af',
                                fontSize: '0.75rem'
                              }}>
                                {customer.country}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.is_active ? 'Active' : 'Inactive'} 
                            size="small" 
                            sx={{
                              backgroundColor: customer.is_active ? '#f0fdf4' : '#fef2f2',
                              color: customer.is_active ? '#059669' : '#dc2626',
                              border: `1px solid ${customer.is_active ? '#bbf7d0' : '#fecaca'}`,
                              fontWeight: '500',
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 14, mr: 1, color: '#6b7280' }} />
                            <Typography variant="body2" sx={{ 
                              color: '#6b7280',
                              fontSize: '0.875rem'
                            }}>
                              {new Date(customer.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, customer)}
                            size="small"
                            sx={{
                              backgroundColor: '#f8fafc',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '50vh',
              textAlign: 'center',
              p: 6,
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}>
              <Box sx={{
                p: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
              }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h5" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                No Customers Found
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280', mb: 4, maxWidth: 400 }}>
                Create your first customer to get started building your customer base.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateCustomer}
                startIcon={<AddIcon />}
                sx={{ 
                  backgroundColor: '#3b82f6',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: '500',
                  fontSize: '1rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Create Your First Customer
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create Customer Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}>
            <PersonIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ color: '#1f2937', mb: 0.5 }}>
              Create New Customer
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Add customer information and contact details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
          {/* Basic Information Section */}
          <Card sx={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Basic Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter customer's full name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  placeholder="Tax ID or GST number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Address Information Section */}
          <Card sx={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LocationIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Address Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, Apt 4B"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="10001"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Additional Information Section */}
          <Card sx={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <EditIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Additional Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        Active Customer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable to allow this customer to make purchases
                      </Typography>
                    </Box>
                  }
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
                  placeholder="Add any additional notes about this customer..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          gap: 2
        }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: '500',
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: '600',
              backgroundColor: '#3b82f6',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#2563eb',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Creating Customer...
              </Box>
            ) : (
              'Create Customer'
            )}
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

      {/* Customer Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ 
              width: 48, 
              height: 48,
              backgroundColor: selectedCustomer?.is_active ? '#3b82f6' : '#6b7280',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {selectedCustomer?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                {selectedCustomer?.name}
              </Typography>
              <Chip 
                label={selectedCustomer?.is_active ? 'Active' : 'Inactive'} 
                size="small" 
                sx={{
                  backgroundColor: selectedCustomer?.is_active ? '#f0fdf4' : '#fef2f2',
                  color: selectedCustomer?.is_active ? '#059669' : '#dc2626',
                  border: `1px solid ${selectedCustomer?.is_active ? '#bbf7d0' : '#fecaca'}`,
                  fontWeight: '500',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                {selectedCustomer?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {selectedCustomer.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {selectedCustomer?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {selectedCustomer.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {selectedCustomer?.tax_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Tax Number
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {selectedCustomer.tax_number}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                Location Information
              </Typography>
              <Stack spacing={2}>
                {selectedCustomer?.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationIcon sx={{ color: '#6b7280', fontSize: 20, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {selectedCustomer.address}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {(selectedCustomer?.city || selectedCustomer?.state || selectedCustomer?.country) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {[selectedCustomer?.city, selectedCustomer?.state, selectedCustomer?.country]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {selectedCustomer?.postal_code && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Postal Code
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                        {selectedCustomer.postal_code}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Grid>
            
            {selectedCustomer?.notes && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                  Notes
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    {selectedCustomer.notes}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Customer Since
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                    {new Date(selectedCustomer?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: '#6b7280' }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              handleEditCustomer(selectedCustomer)
              setViewDialogOpen(false)
            }}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Edit Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Menu */}
      <Menu
        anchorEl={customerMenuAnchor}
        open={Boolean(customerMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleViewCustomer(selectedCustomer); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
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
        aria-label="add customer"
        onClick={handleCreateCustomer}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#3b82f6',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          '&:hover': {
            backgroundColor: '#2563eb',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.6)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <AddIcon sx={{ fontSize: 24 }} />
      </Fab>
    </Box>
  )
}

export default CustomersPage