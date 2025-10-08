import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  Zoom,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Breadcrumbs,
  Link,
  Checkbox,
  Collapse,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Container,
  Divider,
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
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
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

  // Enhanced state management for production-grade UX
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [billMenuAnchor, setBillMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)
  
  // Advanced UI state
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedBills, setSelectedBills] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(24)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showOverdue, setShowOverdue] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)

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
    // Payment options
    payment_method: 'cash',
    payment_amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_reference: '',
    payment_notes: '',
    is_paid: false,
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

  // Enhanced filters with advanced options
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customer_id: '',
    start_date: '',
    end_date: '',
    amount_min: '',
    amount_max: '',
    payment_status: '',
    due_date_from: '',
    due_date_to: '',
    tags: [] as string[],
    priority: '',
    assigned_to: '',
    created_by: '',
  })

  // Advanced sorting and filtering logic
  const filteredAndSortedBills = useMemo(() => {
    let filtered = Array.isArray(bills) ? [...bills] : [] // Create a copy to avoid mutating Redux state
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(bill => 
        bill.bill_number?.toLowerCase().includes(searchLower) ||
        bill.customer?.name?.toLowerCase().includes(searchLower) ||
        bill.customer?.phone?.includes(searchLower) ||
        bill.customer?.email?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.status) {
      filtered = filtered.filter(bill => bill.status === filters.status)
    }
    
    if (filters.customer_id) {
      filtered = filtered.filter(bill => bill.customer_id === filters.customer_id)
    }
    
    if (filters.start_date) {
      filtered = filtered.filter(bill => 
        new Date(bill.bill_date) >= new Date(filters.start_date)
      )
    }
    
    if (filters.end_date) {
      filtered = filtered.filter(bill => 
        new Date(bill.bill_date) <= new Date(filters.end_date)
      )
    }
    
    if (filters.amount_min) {
      filtered = filtered.filter(bill => bill.total_amount >= parseFloat(filters.amount_min))
    }
    
    if (filters.amount_max) {
      filtered = filtered.filter(bill => bill.total_amount <= parseFloat(filters.amount_max))
    }
    
    if (showOverdue) {
      filtered = filtered.filter(bill => {
        if (bill.status === 'paid' || !bill.due_date) return false
        return new Date(bill.due_date) < new Date()
      })
    }
    
    if (showDrafts) {
      filtered = filtered.filter(bill => bill.status === 'draft')
    }
    
    // Note: Archived functionality would need to be implemented in the backend
    // if (showArchived) {
    //   filtered = filtered.filter(bill => bill.archived)
    // }
    
    // Apply sorting (now safe since we have a copy)
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'bill_number':
          aValue = a.bill_number || ''
          bValue = b.bill_number || ''
          break
        case 'customer_name':
          aValue = a.customer?.name || ''
          bValue = b.customer?.name || ''
          break
        case 'total_amount':
          aValue = a.total_amount || 0
          bValue = b.total_amount || 0
          break
        case 'due_date':
          aValue = new Date(a.due_date || a.bill_date || new Date())
          bValue = new Date(b.due_date || b.bill_date || new Date())
          break
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [bills, filters, sortBy, sortOrder, showOverdue, showDrafts])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedBills.length / itemsPerPage)
  const paginatedBills = filteredAndSortedBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Bulk actions
  const handleSelectAll = useCallback(() => {
    if (selectedBills.length === paginatedBills.length) {
      setSelectedBills([])
    } else {
      setSelectedBills(paginatedBills.map(bill => bill.id))
    }
  }, [paginatedBills, selectedBills.length])

  const handleSelectBill = useCallback((billId: string) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    )
  }, [])

  const handleBulkAction = useCallback((action: string) => {
    // Implement bulk actions
    console.log(`Bulk action: ${action} on bills:`, selectedBills)
    setSelectedBills([])
  }, [selectedBills])

  // Advanced search functionality can be implemented here

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
      // Payment options
      payment_method: 'cash',
      payment_amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_reference: '',
      payment_notes: '',
      is_paid: false,
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
      // Payment options
      payment_method: 'cash',
      payment_amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_reference: '',
      payment_notes: '',
      is_paid: false,
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

  // Bills are already handled in filteredAndSortedBills

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 3 }}>
        {/* Modern Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link href="/dashboard" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 0.5 }} />
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 0.5 }} />
                Bills
              </Typography>
            </Breadcrumbs>
            
            <Box sx={{ 
              p: 3,
              background: 'white',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              mb: 3,
            }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
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
                      <ReceiptIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="600" sx={{ color: '#1f2937' }}>
                  Bill Management
                </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                  Create, manage, and track your bills and invoices efficiently.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip 
                    label={`${filteredAndSortedBills.length} Bills`} 
                    size="small" 
                      sx={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        fontWeight: '500',
                      }}
                  />
                  <Chip 
                    label={`₹${stats?.total_amount?.toFixed(2) || '0'} Total`} 
                    size="small" 
                      sx={{
                        backgroundColor: '#f0fdf4',
                        color: '#059669',
                        border: '1px solid #bbf7d0',
                        fontWeight: '500',
                      }}
                  />
                  <Chip 
                    label={`₹${stats?.outstanding_amount?.toFixed(2) || '0'} Outstanding`} 
                    size="small" 
                      sx={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        border: '1px solid #fde68a',
                        fontWeight: '500',
                      }}
                  />
                </Stack>
              </Box>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={() => {
                      setIsRefreshing(true)
                      setTimeout(() => setIsRefreshing(false), 1000)
                    }}
                    disabled={isRefreshing}
                    sx={{
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        '&:hover': { 
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          transform: 'rotate(180deg)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                  >
                    <RefreshIcon sx={{ 
                      animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '500',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                        borderColor: '#9ca3af',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                >
                  Filters
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBill}
                  sx={{
                    borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '500',
                      backgroundColor: '#3b82f6',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                        backgroundColor: '#2563eb',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                      },
                      transition: 'all 0.2s ease'
                  }}
                >
                  Create Bill
                </Button>
              </Stack>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Stats Cards */}
        {stats && (
          <Zoom in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  title: 'Total Bills',
                  value: stats.total_bills,
                  icon: <ReceiptIcon />,
                  color: '#3b82f6',
                  bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  change: '+12%',
                  changeType: 'positive'
                },
                {
                  title: 'Total Amount',
                  value: `₹${stats.total_amount.toFixed(2)}`,
                  icon: <MoneyIcon />,
                  color: '#059669',
                  bgColor: 'linear-gradient(135deg, #10b981, #059669)',
                  change: '+8%',
                  changeType: 'positive'
                },
                {
                  title: 'Outstanding',
                  value: `₹${stats.outstanding_amount.toFixed(2)}`,
                  icon: <TrendingUpIcon />,
                  color: '#d97706',
                  bgColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  change: '-5%',
                  changeType: 'negative'
                },
                {
                  title: 'Overdue',
                  value: `₹${stats.overdue_amount.toFixed(2)}`,
                  icon: <ScheduleIcon />,
                  color: '#dc2626',
                  bgColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  change: '+2%',
                  changeType: 'negative'
                }
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in timeout={1200 + index * 200}>
                    <Card sx={{ 
                      background: 'white',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        borderColor: stat.color,
                      },
                    }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} sx={{ minHeight: 60 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h3" component="div" fontWeight="600" sx={{ 
                              color: '#1f2937', 
                              mb: 0.5,
                              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word'
                            }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#6b7280', 
                              fontWeight: '500',
                              fontSize: '0.875rem',
                              lineHeight: 1.3
                            }}>
                              {stat.title}
                            </Typography>
                          </Box>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: '50%',
                              background: stat.bgColor,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                            flexShrink: 0,
                            ml: 1
                          }}>
                            {stat.icon}
                        </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 'auto' }}>
                          <Chip
                            label={stat.change}
                            size="small"
                            sx={{
                              backgroundColor: stat.changeType === 'positive' ? '#f0fdf4' : '#fef2f2',
                              color: stat.changeType === 'positive' ? '#059669' : '#dc2626',
                              border: `1px solid ${stat.changeType === 'positive' ? '#bbf7d0' : '#fecaca'}`,
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              height: 24,
                            }}
                          />
                          <Typography variant="caption" sx={{ 
                            color: '#9ca3af', 
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}>
                            vs last month
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Zoom>
        )}

        {/* Advanced Filtering Interface */}
        <Collapse in={showFilters}>
          <Fade in={showFilters} timeout={600}>
            <Card sx={{ 
              mb: 3, 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Advanced Filters
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowFilters(false)}
                    startIcon={<CloseIcon />}
                  >
                    Close
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Search Bills"
                      placeholder="Search by bill number, customer name, or phone..."
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
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        input={<OutlinedInput label="Status" />}
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
                      >
                        <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All Status</MenuItem>
                        <MenuItem value="draft" sx={{ fontSize: '0.875rem' }}>Draft</MenuItem>
                        <MenuItem value="sent" sx={{ fontSize: '0.875rem' }}>Sent</MenuItem>
                        <MenuItem value="paid" sx={{ fontSize: '0.875rem' }}>Paid</MenuItem>
                        <MenuItem value="overdue" sx={{ fontSize: '0.875rem' }}>Overdue</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
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
                  
                  <Grid item xs={12} sm={6} md={2}>
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
                  
                  <Grid item xs={12} sm={12} md={2}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', md: 'center' } }}>
                      <Button
                        variant={showOverdue ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setShowOverdue(!showOverdue)}
                        startIcon={<WarningIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          minWidth: 'auto',
                          px: 2,
                          py: 1,
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: 2,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          '&.MuiButton-contained': {
                            backgroundColor: '#ef4444',
                            '&:hover': {
                              backgroundColor: '#dc2626',
                            }
                          },
                          '&.MuiButton-outlined': {
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': {
                              borderColor: '#dc2626',
                              backgroundColor: '#fef2f2',
                            }
                          }
                        }}
                      >
                        Overdue
                      </Button>
                      <Button
                        variant={showDrafts ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setShowDrafts(!showDrafts)}
                        startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          minWidth: 'auto',
                          px: 2,
                          py: 1,
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: 2,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          '&.MuiButton-contained': {
                            backgroundColor: '#6b7280',
                            '&:hover': {
                              backgroundColor: '#4b5563',
                            }
                          },
                          '&.MuiButton-outlined': {
                            borderColor: '#6b7280',
                            color: '#6b7280',
                            '&:hover': {
                              borderColor: '#4b5563',
                              backgroundColor: '#f3f4f6',
                            }
                          }
                        }}
                      >
                        Drafts
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        </Collapse>

        {/* Enhanced Bills Display with View Controls */}
        <Card sx={{ 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Bills ({filteredAndSortedBills.length})
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="table">
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    input={<OutlinedInput label="Sort by" />}
                  >
                    <MenuItem value="created_at">Date Created</MenuItem>
                    <MenuItem value="bill_number">Bill Number</MenuItem>
                    <MenuItem value="customer_name">Customer</MenuItem>
                    <MenuItem value="total_amount">Amount</MenuItem>
                    <MenuItem value="due_date">Due Date</MenuItem>
                  </Select>
                </FormControl>
                
                <IconButton
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  size="small"
                >
                  {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </IconButton>
              </Stack>
            </Box>

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
              <>
                {/* Bulk Actions Bar */}
                {selectedBills.length > 0 && (
                  <Fade in>
                    <Box sx={{ 
                      p: 2, 
                      mb: 2, 
                      background: 'rgba(102, 126, 234, 0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {selectedBills.length} bills selected
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleBulkAction('delete')}
                        >
                          Delete
                        </Button>
                        <Button
                          size="small"
                          startIcon={<ArchiveIcon />}
                          onClick={() => handleBulkAction('archive')}
                        >
                          Archive
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EmailIcon />}
                          onClick={() => handleBulkAction('email')}
                        >
                          Send Email
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setSelectedBills([])}
                        >
                          Clear Selection
                        </Button>
                      </Stack>
                    </Box>
                  </Fade>
                )}

                {/* Bills Display */}
                {paginatedBills.length > 0 ? (
                  viewMode === 'grid' ? (
                    <Grid container spacing={2}>
                      {paginatedBills.map((bill, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={bill.id}>
                          <Zoom in timeout={600 + index * 50}>
                            <Card sx={{ 
                              height: '100%',
                              position: 'relative',
                              background: 'white',
                              borderRadius: 2,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderColor: '#3b82f6',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: bill.status === 'paid' ? '#10b981' : 
                                            bill.status === 'overdue' ? '#ef4444' : 
                                            bill.status === 'sent' ? '#3b82f6' : '#6b7280',
                                borderRadius: '2px 2px 0 0',
                              }
                            }}>
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                {/* Header with bill number and status */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ 
                                      fontSize: '0.875rem',
                                      color: '#1f2937',
                                      fontFamily: 'monospace',
                                    }}>
                                      {bill.bill_number}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={(e) => handleMenuOpen(e, bill)}
                                    size="small"
                                    sx={{ 
                                      width: 28, 
                                      height: 28,
                                      backgroundColor: '#f8fafc',
                                      color: '#64748b',
                                      border: '1px solid #e2e8f0',
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
                                </Box>
                                
                                {/* Customer info - compact */}
                                {bill.customer && (
                                  <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ 
                                      color: '#1f2937',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      mb: 0.5,
                                    }}>
                                      {bill.customer.name}
                                    </Typography>
                                    {bill.customer.phone && (
                                      <Typography variant="caption" sx={{ 
                                        color: '#6b7280',
                                        fontSize: '0.75rem',
                                        display: 'block',
                                      }}>
                                        {bill.customer.phone}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                                
                                {/* Amount - prominent */}
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="h6" fontWeight="600" sx={{ 
                                    color: '#1f2937', 
                                    fontSize: '1.1rem',
                                    mb: 0.5,
                                  }}>
                                    ₹{bill.total_amount.toFixed(2)}
                                  </Typography>
                                  {bill.balance && bill.balance > 0 && (
                                    <Typography variant="caption" sx={{ 
                                      color: '#d97706',
                                      fontSize: '0.75rem',
                                      fontWeight: '500',
                                      backgroundColor: '#fef3c7',
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                    }}>
                                      Balance: ₹{bill.balance.toFixed(2)}
                                    </Typography>
                                  )}
                                </Box>
                                
                                {/* Footer with status and date */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip 
                                    label={bill.status.toUpperCase()} 
                                    size="small" 
                                    sx={{
                                      backgroundColor: bill.status === 'paid' ? '#f0fdf4' : 
                                                      bill.status === 'overdue' ? '#fef2f2' : 
                                                      bill.status === 'sent' ? '#eff6ff' : '#f3f4f6',
                                      color: bill.status === 'paid' ? '#059669' : 
                                             bill.status === 'overdue' ? '#dc2626' : 
                                             bill.status === 'sent' ? '#2563eb' : '#6b7280',
                                      border: `1px solid ${bill.status === 'paid' ? '#bbf7d0' : 
                                                      bill.status === 'overdue' ? '#fecaca' : 
                                                      bill.status === 'sent' ? '#bfdbfe' : '#d1d5db'}`,
                                      fontWeight: '500',
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ 
                                    color: '#9ca3af',
                                    fontSize: '0.75rem',
                                  }}>
                                    {new Date(bill.bill_date).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox" sx={{ width: 50 }}>
                              <Checkbox
                                indeterminate={selectedBills.length > 0 && selectedBills.length < paginatedBills.length}
                                checked={selectedBills.length === paginatedBills.length && paginatedBills.length > 0}
                                onChange={handleSelectAll}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Bill #</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
                            <TableCell sx={{ width: 50 }}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedBills.map((bill) => (
                            <TableRow key={bill.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedBills.includes(bill.id)}
                                  onChange={() => handleSelectBill(bill.id)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                                  {bill.bill_number}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                                    {bill.customer?.name || 'N/A'}
                                  </Typography>
                                  {bill.customer?.phone && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                      {bill.customer.phone}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {new Date(bill.bill_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                                  ₹{bill.total_amount.toFixed(2)}
                                </Typography>
                                {bill.balance && bill.balance > 0 && (
                                  <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.7rem' }}>
                                    Balance: ₹{bill.balance.toFixed(2)}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={bill.status.toUpperCase()} 
                                  size="small" 
                                  sx={{
                                    backgroundColor: bill.status === 'paid' ? '#10b981' : 
                                                    bill.status === 'overdue' ? '#ef4444' : 
                                                    bill.status === 'sent' ? '#3b82f6' : '#6b7280',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={(e) => handleMenuOpen(e, bill)}
                                  size="small"
                                  sx={{ width: 32, height: 32 }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
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
                      <ReceiptIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                      No Bills Found
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mb: 4, maxWidth: 400 }}>
                      Create your first bill to get started with invoice management.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleCreateBill}
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
                      Create Your First Bill
                    </Button>
                  </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(_, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Create Bill Dialog */}
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
            <ReceiptIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ color: '#1f2937', mb: 0.5 }}>
              Create New Bill
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Add bill details and payment information
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Enhanced Customer Selection */}
            <Grid item xs={12}>
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
                    <PeopleIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                    Customer Information
                  </Typography>
                </Box>
                
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                      },
                    }
                  }}
              />
              
              {/* Show found customer or new customer form */}
              {customerLookup.foundCustomer && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    '& .MuiAlert-icon': {
                      color: '#059669'
                    }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#059669' }}>
                    Found Customer:
                  </Typography>
                  <Typography sx={{ color: '#047857' }}>
                    {customerLookup.foundCustomer.name} - {customerLookup.foundCustomer.phone}
                  </Typography>
                </Alert>
              )}
              
              {customerLookup.showCustomerForm && (
                <Box sx={{ 
                  p: 3, 
                  border: '2px dashed #3b82f6', 
                  borderRadius: 2, 
                  mb: 2,
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AddIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#1e40af' }}>
                      New Customer Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Customer Name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        required
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
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                          }
                        }}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              </Card>
            </Grid>
            {/* Enhanced Bill Details */}
            <Grid item xs={12}>
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
                    <ReceiptIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                    Bill Details
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bill Date"
                type="date"
                value={formData.bill_date}
                onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
            </Grid>
            {/* Enhanced Tax and Discount Section */}
            <Grid item xs={12}>
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
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MoneyIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                    Tax & Discount
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
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
                      label="Discount (₹)"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
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
            </Grid>

            {/* Enhanced Items Section */}
            <Grid item xs={12}>
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
                    <InventoryIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                    Bill Items
                  </Typography>
                </Box>
              {formData.items.map((item, index) => {
                const selectedItem = items.find(i => i.id === item.item_id)
                return (
                  <Card key={index} sx={{ 
                    mb: 3, 
                    p: 3, 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: 1,
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Typography variant="body2" fontWeight="600">
                          {index + 1}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#1f2937' }}>
                        Item {index + 1}
                      </Typography>
                      {formData.items.length > 1 && (
                        <IconButton 
                          onClick={() => removeItem(index)} 
                          size="small"
                          sx={{
                            ml: 'auto',
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            '&:hover': {
                              backgroundColor: '#fecaca',
                              color: '#b91c1c',
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Select Item</InputLabel>
                        <Select
                          value={item.item_id}
                          onChange={(e) => handleItemSelection(index, e.target.value)}
                          input={<OutlinedInput label="Select Item" />}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'white',
                              }
                            }}
                        >
                          {items.map((itemOption) => (
                            <MenuItem key={itemOption.id} value={itemOption.id}>
                              <Box>
                                  <Typography variant="body2" fontWeight="500">{itemOption.name}</Typography>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
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
                        label="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder={selectedItem?.description || 'Item description'}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                            }
                          }}
                      />
                    </Grid>
                    {selectedItem && (
                      <Grid item xs={12}>
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mt: 2,
                              borderRadius: 2,
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              '& .MuiAlert-icon': {
                                color: '#2563eb'
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#1e40af' }}>
                            <strong>Item Details:</strong> {selectedItem.name} | 
                            Available: {selectedItem.quantity} units | 
                            Total: ₹{(item.quantity * item.unit_price).toFixed(2)}
        </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                  </Card>
                )
              })}
              
              <Button 
                onClick={addItem} 
                startIcon={<AddIcon />} 
                variant="outlined"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  py: 1.5,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: '500',
                  '&:hover': {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderColor: '#3b82f6',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Add Another Item
              </Button>
              </Card>
            </Grid>

            {/* Enhanced Notes and Terms Section */}
            <Grid item xs={12}>
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
                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any additional notes for this bill..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                        }
                      }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                      label="Terms & Conditions"
                multiline
                rows={2}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      placeholder="Payment terms, delivery conditions, etc..."
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
            </Grid>

            {/* Payment Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937', px: 2 }}>
                  Payment Information
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.is_paid ? 'paid' : 'unpaid'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    is_paid: e.target.value === 'paid',
                    payment_amount: e.target.value === 'paid' ? 
                      formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0) * (1 + formData.tax_rate / 100) - formData.discount : 0
                  })}
                  input={<OutlinedInput label="Payment Status" />}
                >
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  input={<OutlinedInput label="Payment Method" />}
                  disabled={!formData.is_paid}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.is_paid && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    type="number"
                    value={formData.payment_amount}
                    onChange={(e) => setFormData({ ...formData, payment_amount: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Leave 0 for full payment"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Reference"
                    value={formData.payment_reference}
                    onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                    placeholder="Transaction ID, Check Number, etc."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Notes"
                    value={formData.payment_notes}
                    onChange={(e) => setFormData({ ...formData, payment_notes: e.target.value })}
                    placeholder="Additional payment details"
                  />
                </Grid>
              </>
            )}

            {/* Bill Summary */}
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 2
              }}>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937', mb: 2 }}>
                  Bill Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    ₹{formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tax ({formData.tax_rate}%):
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    ₹{(formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0) * formData.tax_rate / 100).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Discount:
                  </Typography>
                  <Typography variant="body2" fontWeight="500" color="success.main">
                    -₹{formData.discount.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" fontWeight="600" color="primary">
                    Total Amount:
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="primary">
                    ₹{(formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0) * (1 + formData.tax_rate / 100) - formData.discount).toFixed(2)}
                  </Typography>
                </Box>
                {formData.is_paid && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Amount:
                    </Typography>
                    <Typography variant="body2" fontWeight="500" color="success.main">
                      ₹{formData.payment_amount.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
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
                Creating Bill...
              </Box>
            ) : (
              'Create Bill'
            )}
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
        aria-label="add bill"
        onClick={handleCreateBill}
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

export default BillsPage
