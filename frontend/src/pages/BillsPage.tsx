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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Fade,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  fetchBills,
  createBill,
  deleteBill,
  addPayment,
  fetchBillStats,
  clearError,
} from '../store/slices/billSlice'
import { fetchShops, setCurrentShop } from '../store/slices/shopSlice'
import { fetchCustomers, createCustomer } from '../store/slices/customerSlice'
import { fetchItems } from '../store/slices/itemSlice'

const BillsPage: React.FC = () => {
  const dispatch = useDispatch()
  const { bills, stats, loading, error } = useSelector((state: RootState) => state.bill)
  const { currentShop, shops } = useSelector((state: RootState) => state.shop)
  const { customers } = useSelector((state: RootState) => state.customer)
  const { items } = useSelector((state: RootState) => state.item)

  // State for forms and UI
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [billMenuAnchor, setBillMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_phone: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [{ item_id: '', quantity: 1, unit_price: 0, description: '' }],
    discount: 0,
    tax_rate: 0,
    notes: '',
    terms: '',
  })

  // Customer lookup state
  const [customerLookup, setCustomerLookup] = useState({
    phone: '',
    foundCustomer: null as any,
    isNewCustomer: false,
    showCustomerForm: false,
  })

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference: '',
    notes: '',
  })

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customer_id: '',
    start_date: '',
    end_date: '',
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

  // Fetch data when shop is available
  useEffect(() => {
    if (currentShop?.id) {
      dispatch(fetchBills({ shopId: currentShop.id, filters }) as any)
      dispatch(fetchBillStats(currentShop.id) as any)
      dispatch(fetchCustomers({ shopId: currentShop.id }) as any)
      dispatch(fetchItems({ shopId: currentShop.id }) as any)
    }
  }, [dispatch, currentShop, filters])

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Handle create bill
  const handleCreateBill = () => {
    console.log('handleCreateBill called')
    console.log('currentShop:', currentShop)
    setFormData({
      customer_id: '',
      customer_phone: '',
      customer_name: '',
      customer_email: '',
      customer_address: '',
      bill_date: new Date().toISOString().split('T')[0],
      due_date: '',
      items: [{ item_id: '', quantity: 1, unit_price: 0, description: '' }],
      discount: 0,
      tax_rate: 0,
      notes: '',
      terms: '',
    })
    setCustomerLookup({
      phone: '',
      foundCustomer: null,
      isNewCustomer: false,
      showCustomerForm: false,
    })
    setCreateDialogOpen(true)
  }

  // Handle customer phone input change
  const handleCustomerPhoneChange = (phone: string) => {
    setCustomerLookup(prev => ({ ...prev, phone }))
    setFormData(prev => ({ ...prev, customer_phone: phone }))
  }

  // Handle customer phone lookup (called when user stops typing)
  const handleCustomerPhoneLookup = async (phone: string) => {
    if (!phone || phone.length < 10) return

    // Find customer by phone
    const foundCustomer = customers.find(customer => 
      customer.phone === phone || customer.phone === `+${phone}` || customer.phone === `+91${phone}`
    )

    if (foundCustomer) {
      setCustomerLookup(prev => ({ 
        ...prev, 
        foundCustomer, 
        isNewCustomer: false,
        showCustomerForm: false 
      }))
      setFormData(prev => ({
        ...prev,
        customer_id: foundCustomer.id,
        customer_phone: foundCustomer.phone,
        customer_name: foundCustomer.name,
        customer_email: foundCustomer.email,
        customer_address: foundCustomer.address,
      }))
    } else {
      setCustomerLookup(prev => ({ 
        ...prev, 
        foundCustomer: null, 
        isNewCustomer: true,
        showCustomerForm: true 
      }))
      setFormData(prev => ({
        ...prev,
        customer_id: '',
        customer_phone: phone,
        customer_name: '',
        customer_email: '',
        customer_address: '',
      }))
    }
  }

  // Handle item selection with auto-population
  const handleItemSelection = (index: number, itemId: string) => {
    const selectedItem = items.find(item => item.id === itemId)
    if (selectedItem) {
      updateItem(index, 'item_id', itemId)
      updateItem(index, 'unit_price', selectedItem.price || selectedItem.cost_price)
      updateItem(index, 'description', selectedItem.description || '')
    }
  }

  // Handle add payment
  const handleAddPayment = (bill: any) => {
    setPaymentFormData({
      amount: bill.balance,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference: '',
      notes: '',
    })
    setSelectedBill(bill)
    setPaymentDialogOpen(true)
  }

  // Handle delete bill
  const handleDeleteBill = async () => {
    if (!selectedBill?.id || !currentShop?.id) return

    setIsSubmitting(true)
    try {
      const result = await dispatch(deleteBill({ shopId: currentShop.id, billId: selectedBill.id }) as any)
      
      if (deleteBill.fulfilled.match(result)) {
        setSuccessMessage('Bill deleted successfully!')
        setShowSuccessSnackbar(true)
        setBillMenuAnchor(null)
        setSelectedBill(null)
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
    console.log('handleFormSubmit called')
    console.log('currentShop:', currentShop)
    console.log('formData:', formData)
    
    if (!currentShop?.id) {
      console.log('No current shop ID available')
      setSuccessMessage('No shop selected. Please select a shop first.')
      setShowSuccessSnackbar(true)
      return
    }

    // Validate form data
    const hasValidItems = formData.items.some(item => item.item_id && item.quantity > 0)
    if (!hasValidItems) {
      console.log('No valid items in form')
      setSuccessMessage('Please add at least one item to the bill.')
      setShowSuccessSnackbar(true)
      return
    }

    setIsSubmitting(true)
    try {
      let customerId = formData.customer_id

      // Create new customer if needed
      if (customerLookup.isNewCustomer && formData.customer_phone) {
        console.log('Creating new customer...')
        const customerData = {
          name: formData.customer_name,
          email: formData.customer_email,
          phone: formData.customer_phone,
          address: formData.customer_address,
        }
        
        const customerResult = await dispatch(createCustomer({ shopId: currentShop.id, customerData }) as any)
        if (createCustomer.fulfilled.match(customerResult)) {
          customerId = customerResult.payload.id
          console.log('Customer created:', customerResult.payload)
        } else {
          setSuccessMessage(`Error creating customer: ${customerResult.payload}`)
          setShowSuccessSnackbar(true)
          setIsSubmitting(false)
          return
        }
      }

      // Prepare bill data with customer ID
      const billData = {
        ...formData,
        customer_id: customerId,
      }

      console.log('Dispatching createBill...')
      const result = await dispatch(createBill({ shopId: currentShop.id, billData }) as any)
      console.log('createBill result:', result)
      
      if (createBill.fulfilled.match(result)) {
        setSuccessMessage('Bill created successfully!')
        setShowSuccessSnackbar(true)
        setCreateDialogOpen(false)
        setFormData({
          customer_id: '',
          customer_phone: '',
          customer_name: '',
          customer_email: '',
          customer_address: '',
          bill_date: new Date().toISOString().split('T')[0],
          due_date: '',
          items: [{ item_id: '', quantity: 1, unit_price: 0, description: '' }],
          discount: 0,
          tax_rate: 0,
          notes: '',
          terms: '',
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

  // Handle payment form submission
  const handlePaymentFormSubmit = async () => {
    if (!selectedBill?.id || !currentShop?.id) return

    setIsSubmitting(true)
    try {
      const result = await dispatch(addPayment({ shopId: currentShop.id, billId: selectedBill.id, paymentData: paymentFormData }) as any)
      
      if (addPayment.fulfilled.match(result)) {
        setSuccessMessage('Payment added successfully!')
        setShowSuccessSnackbar(true)
        setPaymentDialogOpen(false)
        setSelectedBill(null)
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
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bill: any) => {
    setBillMenuAnchor(event.currentTarget)
    setSelectedBill(bill)
  }

  const handleMenuClose = () => {
    setBillMenuAnchor(null)
    setSelectedBill(null)
  }

  // Add item to form
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: '', quantity: 1, unit_price: 0, description: '' }]
    }))
  }

  // Remove item from form
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // Update item in form
  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Debounced customer lookup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customerLookup.phone && customerLookup.phone.length >= 10) {
        handleCustomerPhoneLookup(customerLookup.phone)
      }
    }, 1000) // 1 second delay

    return () => clearTimeout(timeoutId)
  }, [customerLookup.phone])

  // Ensure bills is an array
  const billsArray = Array.isArray(bills) ? bills : []

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Bill Management
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
          Create, manage, and track your bills and invoices efficiently.
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
                <ReceiptIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937">
                  {stats.total_bills}
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Total Bills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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
                <MoneyIcon sx={{ fontSize: 40, color: '#059669', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937">
                  ₹{stats.total_amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Total Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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
                <TrendingUpIcon sx={{ fontSize: 40, color: '#d97706', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937">
                  ₹{stats.outstanding_amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Outstanding
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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
                <ScheduleIcon sx={{ fontSize: 40, color: '#dc2626', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937">
                  ₹{stats.overdue_amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Overdue
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search bills..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
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
            Loading bills...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {billsArray.length > 0 ? billsArray.map((bill, index) => (
            <Grid item xs={12} sm={6} md={4} key={bill.id}>
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
                        <ReceiptIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {bill.bill_number}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, bill)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    {bill.customer && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Customer: {bill.customer.name}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Date: {new Date(bill.bill_date).toLocaleDateString()}
                    </Typography>
                    
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      ₹{bill.total_amount.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip 
                        label={bill.status.toUpperCase()} 
                        size="small" 
                        color={
                          bill.status === 'paid' ? 'success' :
                          bill.status === 'overdue' ? 'error' :
                          bill.status === 'sent' ? 'info' : 'default'
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(bill.created_at).toLocaleDateString()}
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
                <ReceiptIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="white">
                  No Bills Found
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
                  Create your first bill to get started.
        </Typography>
        <Button
          variant="contained"
                  onClick={handleCreateBill}
          startIcon={<AddIcon />}
                  sx={{ borderRadius: 2 }}
        >
                  Create Your First Bill
        </Button>
      </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Bill Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Smart Customer Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Customer Information</Typography>
              <TextField
                fullWidth
                label="Customer Phone Number"
                placeholder="Enter phone number to find existing customer"
                value={customerLookup.phone}
                onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                onBlur={() => handleCustomerPhoneLookup(customerLookup.phone)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">📱</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              
              {/* Show found customer or new customer form */}
              {customerLookup.foundCustomer && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Found Customer:</Typography>
                  <Typography>{customerLookup.foundCustomer.name} - {customerLookup.foundCustomer.phone}</Typography>
                </Alert>
              )}
              
              {customerLookup.showCustomerForm && (
                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>New Customer Details:</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Customer Name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        value={formData.customer_address}
                        onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bill Date"
                type="date"
                value={formData.bill_date}
                onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
              {formData.items.map((item, index) => {
                const selectedItem = items.find(i => i.id === item.item_id)
                return (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Select Item</InputLabel>
                        <Select
                          value={item.item_id}
                          onChange={(e) => handleItemSelection(index, e.target.value)}
                          input={<OutlinedInput label="Select Item" />}
                        >
                          {items.map((itemOption) => (
                            <MenuItem key={itemOption.id} value={itemOption.id}>
                              <Box>
                                <Typography variant="body2">{itemOption.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Available: {itemOption.quantity} | Price: ₹{itemOption.price || itemOption.cost_price}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: selectedItem?.quantity || 999 }}
                        helperText={selectedItem ? `Max: ${selectedItem.quantity}` : ''}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Unit Price"
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        helperText={selectedItem ? `From item: ₹${selectedItem.price || selectedItem.cost_price}` : ''}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder={selectedItem?.description || 'Item description'}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton onClick={() => removeItem(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    {selectedItem && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Item Details:</strong> {selectedItem.name} | 
                            Available: {selectedItem.quantity} units | 
                            Total: ₹{(item.quantity * item.unit_price).toFixed(2)}
        </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                )
              })}
              <Button onClick={addItem} startIcon={<AddIcon />} variant="outlined">
                Add Another Item
              </Button>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms"
                multiline
                rows={2}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
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
            {isSubmitting ? <CircularProgress size={20} /> : 'Create Bill'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentFormData.payment_date}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                  input={<OutlinedInput label="Payment Method" />}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference"
                value={paymentFormData.reference}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, reference: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePaymentFormSubmit} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Add Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Menu */}
      <Menu
        anchorEl={billMenuAnchor}
        open={Boolean(billMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleAddPayment(selectedBill); handleMenuClose(); }}>
          <PaymentIcon sx={{ mr: 1 }} />
          Add Payment
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteBill(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Bill
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
        aria-label="add bill"
        onClick={handleCreateBill}
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

export default BillsPage
