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
  ListItemText,
  Checkbox,
  Alert,
  Skeleton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Snackbar,
  Fade,
  Slide,
  Zoom,
  Tooltip,
  Paper,
  Autocomplete,
  Popper,
  CircularProgress,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  fetchItems,
  deleteItem,
  getCategories,
  createItem,
  updateItem,
  clearError,
} from '../store/slices/itemSlice'
import { setCurrentShop, fetchShops } from '../store/slices/shopSlice'

interface FilterState {
  search: string
  category: string
  lowStock: boolean
  isActive: boolean
}

interface ItemFormData {
  name: string
  description: string
  sku: string
  price: number
  cost_price: number
  tax_rate: number
  category: string
  quantity: number
  min_quantity: number
  unit: string
  barcode: string
  is_active: boolean
}

interface FormErrors {
  name?: string
  price?: string
  quantity?: string
  min_quantity?: string
  cost_price?: string
}

const ItemsPage: React.FC = () => {
  const dispatch = useDispatch()
  const { items, loading, error, categories } = useSelector((state: RootState) => state.item)
  const { currentShop, shops } = useSelector((state: RootState) => state.shop)

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    lowStock: false,
    isActive: true,
  })

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null)
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null)
  const [itemMenuAnchor, setItemMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    cost_price: 0,
    tax_rate: 0,
    category: '',
    quantity: 0,
    min_quantity: 0,
    unit: 'PCS',
    barcode: '',
    is_active: true,
  })
  
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)
  
  // Advanced UX states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Fetch shops if not already loaded
    if (shops.length === 0) {
      console.log('No shops loaded, fetching shops...')
      dispatch(fetchShops() as any)
    }
  }, [dispatch, shops.length])

  useEffect(() => {
    // If no current shop is selected but shops are available, select the first one
    if (!currentShop && shops.length > 0) {
      console.log('No current shop selected, setting first shop as current:', shops[0])
      dispatch(setCurrentShop(shops[0]) as any)
    }
  }, [dispatch, currentShop, shops])

  useEffect(() => {
    if (currentShop?.id) {
      console.log('Current shop ID available, fetching items:', currentShop.id)
      dispatch(fetchItems({ shopId: currentShop.id }) as any)
      dispatch(getCategories(currentShop.id) as any)
    } else {
      console.log('No current shop ID available for fetching items')
    }
  }, [dispatch, currentShop])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (currentShop?.id) {
      dispatch(fetchItems({ shopId: currentShop.id, filters: { ...filters, [key]: value } }) as any)
    }
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    if (currentShop?.id) {
      dispatch(fetchItems({ shopId: currentShop.id, filters: { ...filters, search: value } }) as any)
    }
  }

  const handleDeleteItem = (itemId: string) => {
    if (currentShop?.id) {
      dispatch(deleteItem({ shopId: currentShop.id, itemId }) as any)
    }
    setItemMenuAnchor(null)
  }

  const validateForm = (): boolean => {
    console.log('Validating form with data:', formData)
    const errors: FormErrors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0'
    } else if (formData.price > 999999) {
      errors.price = 'Price cannot exceed ₹999,999'
    }
    
    if (formData.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative'
    } else if (formData.quantity > 999999) {
      errors.quantity = 'Quantity cannot exceed 999,999'
    }
    
    if (formData.min_quantity < 0) {
      errors.min_quantity = 'Minimum quantity cannot be negative'
    } else if (formData.min_quantity > 999999) {
      errors.min_quantity = 'Minimum quantity cannot exceed 999,999'
    }
    
    if (formData.cost_price < 0) {
      errors.cost_price = 'Cost price cannot be negative'
    } else if (formData.cost_price > 999999) {
      errors.cost_price = 'Cost price cannot exceed ₹999,999'
    }
    
    console.log('Form validation errors:', errors)
    setFormErrors(errors)
    const isValid = Object.keys(errors).length === 0
    console.log('Form is valid:', isValid)
    return isValid
  }

  const handleFormSubmit = async () => {
    console.log('Form submission started', { formData, currentShop: currentShop?.id })
    
    if (!validateForm()) {
      console.log('Form validation failed', formErrors)
      return
    }
    
    if (!currentShop?.id) {
      console.error('No current shop ID available')
      return
    }
    
    setIsSubmitting(true)
    try {
      console.log('Dispatching createItem action', { shopId: currentShop.id, itemData: formData })
      const result = await dispatch(createItem({ shopId: currentShop.id, itemData: formData }) as any)
      
      console.log('Create item result:', result)
      
      if (createItem.fulfilled.match(result)) {
        console.log('Item created successfully')
        // Success - close dialog and refresh items
        setSuccessMessage('Item created successfully!')
        setShowSuccessSnackbar(true)
        handleCloseCreateDialog()
        // Refresh the items list
        dispatch(fetchItems({ shopId: currentShop.id }) as any)
      } else if (createItem.rejected.match(result)) {
        console.error('Failed to create item:', result.payload)
        // Show error message to user
        setSuccessMessage(`Error: ${result.payload}`)
        setShowSuccessSnackbar(true)
      }
    } catch (error) {
      console.error('Unexpected error creating item:', error)
      setSuccessMessage(`Unexpected error: ${error}`)
      setShowSuccessSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFormSubmit = async () => {
    if (!validateForm() || !currentShop?.id || !selectedItem?.id) return
    
    setIsSubmitting(true)
    try {
      const result = await dispatch(updateItem({ 
        shopId: currentShop.id, 
        itemId: selectedItem.id, 
        itemData: formData 
      }) as any)
      
      if (updateItem.fulfilled.match(result)) {
        // Success - close dialog and refresh items
        setSuccessMessage('Item updated successfully!')
        setShowSuccessSnackbar(true)
        setEditDialogOpen(false)
        setSelectedItem(null)
        // Refresh the items list
        dispatch(fetchItems({ shopId: currentShop.id }) as any)
      } else if (updateItem.rejected.match(result)) {
        // Error is already handled by Redux slice
        console.error('Failed to update item:', result.payload)
      }
    } catch (error) {
      console.error('Unexpected error updating item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: 0,
      cost_price: 0,
      tax_rate: 0,
      category: '',
      quantity: 0,
      min_quantity: 0,
      unit: 'PCS',
      barcode: '',
      is_active: true,
    })
    setFormErrors({})
  }

  const handleEditItem = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      sku: item.sku || '',
      price: item.price,
      cost_price: item.cost_price || 0,
      tax_rate: item.tax_rate || 0,
      category: item.category || '',
      quantity: item.quantity,
      min_quantity: item.min_quantity || 0,
      unit: item.unit || 'PCS',
      barcode: item.barcode || '',
      is_active: item.is_active,
    })
    setEditDialogOpen(true)
    setItemMenuAnchor(null)
  }

  const handleBulkImport = () => {
    // TODO: Implement bulk import functionality
    setBulkDialogOpen(true)
  }

  const handleBulkExport = () => {
    // TODO: Implement bulk export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Description,SKU,Price,Cost Price,Category,Quantity,Min Quantity,Unit,Barcode\n" +
      items.map(item => 
        `"${item.name}","${item.description || ''}","${item.sku || ''}",${item.price},${item.cost_price || 0},"${item.category || ''}",${item.quantity},${item.min_quantity},"${item.unit}","${item.barcode || ''}"`
      ).join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'items.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Ensure items is an array
  const itemsArray = Array.isArray(items) ? items : []
  console.log('ItemsPage: Items state:', { items, isArray: Array.isArray(items), length: items?.length })
  
  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : []
  console.log('ItemsPage: Categories state:', { categories, isArray: Array.isArray(categories), length: categories?.length })

  const filteredItems = itemsArray.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.description?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.sku?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.category && item.category !== filters.category) {
      return false
    }
    if (filters.lowStock && !item.is_low_stock) {
      return false
    }
    if (filters.isActive !== undefined && item.is_active !== filters.isActive) {
      return false
    }
    return true
  })

  const lowStockCount = itemsArray.filter(item => item.is_low_stock).length

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Modern Header */}
        <Fade in timeout={800}>
          <Paper elevation={0} sx={{
            background: 'white',
            borderRadius: 3,
            p: 4,
            mb: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                }}>
                  <InventoryIcon sx={{ fontSize: 24 }} />
                  <Typography variant="h4" fontWeight="600" sx={{ fontSize: '1.75rem' }}>
                    Inventory Management
                  </Typography>
                </Box>
                
                <Box display="flex" gap={2}>
                  <Chip
                    icon={<StoreIcon />}
                    label={`${items.length} Items`}
                    sx={{ 
                      fontWeight: '500',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      '&:hover': { 
                        backgroundColor: '#e2e8f0',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                  
                  {lowStockCount > 0 && (
                    <Chip
                      icon={<WarningIcon />}
                      label={`${lowStockCount} Low Stock`}
                      sx={{ 
                        fontWeight: '500',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        '&:hover': { 
                          backgroundColor: '#fee2e2',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={() => {
                      setIsRefreshing(true)
                      if (currentShop?.id) {
                        dispatch(fetchItems({ shopId: currentShop.id }) as any)
                      }
                      setTimeout(() => setIsRefreshing(false), 1000)
                    }}
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
                      '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
                    }} />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  onClick={handleBulkImport}
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
                  Import
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleBulkExport}
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
                  Export
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    console.log('Create item button clicked')
                    setCreateDialogOpen(true)
                  }}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: '500',
                    fontSize: '0.95rem',
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
                  Add Item
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Search and Filter Section */}
        <Slide direction="down" in timeout={1000}>
          <Paper elevation={0} sx={{
            background: 'white',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          }}>
            <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
              {/* Search Input */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Autocomplete
                  freeSolo
                  options={searchSuggestions}
                  value={filters.search}
                  onChange={(_, newValue) => {
                    handleSearch(typeof newValue === 'string' ? newValue : newValue || '')
                  }}
                  onInputChange={(_, newInputValue) => {
                    handleSearch(newInputValue)
                    // Generate suggestions based on item names
                    const suggestions = items
                      .map(item => item.name)
                      .filter(name => name.toLowerCase().includes(newInputValue.toLowerCase()))
                      .slice(0, 5)
                    setSearchSuggestions(suggestions)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search items, SKU, or categories..."
                      InputProps={{
                        ...params.InputProps,
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
                  )}
                  PopperComponent={(props) => (
                    <Popper {...props} placement="bottom-start" sx={{ zIndex: 1300 }} />
                  )}
                />
              </Box>
              
              {/* Filter Button */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
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
              
              {/* View Mode Toggle */}
              <Box display="flex" gap={1} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 0.5 }}>
                <Tooltip title="Grid View">
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    size="small"
                    sx={{
                      backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : '#64748b',
                      borderRadius: 1.5,
                      '&:hover': {
                        backgroundColor: viewMode === 'grid' ? '#2563eb' : '#f1f5f9',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <GridIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="List View">
                  <IconButton
                    onClick={() => setViewMode('list')}
                    size="small"
                    sx={{
                      backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
                      color: viewMode === 'list' ? 'white' : '#64748b',
                      borderRadius: 1.5,
                      '&:hover': {
                        backgroundColor: viewMode === 'list' ? '#2563eb' : '#f1f5f9',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Sort Options */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.875rem' }}>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{ 
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    '& .MuiSelect-select': {
                      padding: '8px 12px'
                    }
                  }}
                >
                  <MenuItem value="name" sx={{ fontSize: '0.875rem' }}>Name</MenuItem>
                  <MenuItem value="price" sx={{ fontSize: '0.875rem' }}>Price</MenuItem>
                  <MenuItem value="quantity" sx={{ fontSize: '0.875rem' }}>Quantity</MenuItem>
                  <MenuItem value="category" sx={{ fontSize: '0.875rem' }}>Category</MenuItem>
                  <MenuItem value="created_at" sx={{ fontSize: '0.875rem' }}>Date Added</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                sx={{
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
                {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </IconButton>
            </Box>
            
            {/* Active Filter Chips */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {filters.lowStock && (
                <Zoom in>
                  <Chip
                    label="Low Stock"
                    onDelete={() => handleFilterChange('lowStock', false)}
                    icon={<WarningIcon />}
                    sx={{ 
                      fontWeight: '500',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      '&:hover': { 
                        backgroundColor: '#fee2e2',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Zoom>
              )}
              {filters.category && (
                <Zoom in>
                  <Chip
                    label={filters.category}
                    onDelete={() => handleFilterChange('category', '')}
                    icon={<CategoryIcon />}
                    sx={{ 
                      fontWeight: '500',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      '&:hover': { 
                        backgroundColor: '#dbeafe',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Zoom>
              )}
              {filters.search && (
                <Zoom in>
                  <Chip
                    label={`Search: "${filters.search}"`}
                    onDelete={() => handleSearch('')}
                    icon={<SearchIcon />}
                    sx={{ 
                      fontWeight: '500',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      '&:hover': { 
                        backgroundColor: '#dcfce7',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Zoom>
              )}
            </Box>
          </Paper>
        </Slide>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange('lowStock', !filters.lowStock)}>
          <Checkbox checked={filters.lowStock} />
          <ListItemText primary="Low Stock" />
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('isActive', !filters.isActive)}>
          <Checkbox checked={filters.isActive} />
          <ListItemText primary="Active Items" />
        </MenuItem>
      </Menu>

      {/* Category Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange('category', '')}>
          All Categories
        </MenuItem>
        {categoriesArray.map((category: string) => (
          <MenuItem key={category} onClick={() => handleFilterChange('category', category)}>
            {category}
          </MenuItem>
        ))}
      </Menu>

        {/* No Shops Message */}
        {shops.length === 0 && !loading && (
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
              No Shops Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You need to create a shop first before managing items.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => dispatch(fetchShops() as any)}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        )}

        {/* Items Display */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={index * 100}>
                  <Card sx={{
                    background: 'white',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : filteredItems.length === 0 ? (
          <Fade in timeout={1000}>
            <Paper elevation={0} sx={{
              p: 6,
              textAlign: 'center',
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
                <InventoryIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h5" fontWeight="600" color="#1f2937" mb={2}>
                {filters.search || filters.category || filters.lowStock
                  ? 'No items match your filters'
                  : 'Your inventory is empty'}
              </Typography>
              <Typography color="#6b7280" mb={4} sx={{ maxWidth: 400, mx: 'auto', fontSize: '1rem' }}>
                {filters.search || filters.category || filters.lowStock
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Start building your inventory by adding your first item. It\'s quick and easy!'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
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
                {filters.search || filters.category || filters.lowStock ? 'Clear Filters' : 'Add Your First Item'}
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Fade in timeout={index * 100}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'white',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        borderColor: '#3b82f6',
                        '& .item-actions': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: item.is_low_stock 
                          ? '#ef4444'
                          : '#10b981',
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
                      {/* Header with Actions */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flexGrow={1} minWidth={0}>
                          <Typography 
                            variant="h6" 
                            fontWeight="600" 
                            sx={{
                              color: '#1f2937',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '1.1rem',
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 1,
                              fontSize: '0.875rem',
                            }}
                          >
                            {item.description || 'No description available'}
                          </Typography>
                          {item.sku && (
                            <Typography variant="caption" sx={{ 
                              color: '#9ca3af',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              backgroundColor: '#f3f4f6',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}>
                              SKU: {item.sku}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box className="item-actions" sx={{
                          opacity: 0,
                          transform: 'translateY(-10px)',
                          transition: 'all 0.2s ease',
                        }}>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setSelectedItem(item)
                                setItemMenuAnchor(e.currentTarget)
                              }}
                              sx={{
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
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Price and Quantity */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="h5" fontWeight="600" sx={{
                            color: '#1f2937',
                            fontSize: '1.5rem',
                          }}>
                            ₹{item.price.toFixed(2)}
                          </Typography>
                          {item.cost_price && item.cost_price > 0 && (
                            <Typography variant="caption" sx={{
                              color: '#6b7280',
                              fontSize: '0.75rem',
                            }}>
                              Cost: ₹{item.cost_price.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box textAlign="right">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{
                              color: '#6b7280',
                              fontSize: '0.875rem',
                            }}>
                              Stock:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{
                                color: item.is_low_stock ? '#dc2626' : '#059669',
                                fontWeight: '600',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                backgroundColor: item.is_low_stock 
                                  ? '#fef2f2' 
                                  : '#f0fdf4',
                                border: `1px solid ${item.is_low_stock ? '#fecaca' : '#bbf7d0'}`,
                                fontSize: '0.875rem',
                              }}
                            >
                              {item.quantity} {item.unit}
                            </Typography>
                          </Box>
                          {item.min_quantity > 0 && (
                            <Typography variant="caption" sx={{
                              color: '#9ca3af',
                              fontSize: '0.75rem',
                            }}>
                              Min: {item.min_quantity}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Tags and Status */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {item.category && (
                            <Chip 
                              label={item.category} 
                              size="small" 
                              icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                              sx={{ 
                                fontWeight: '500',
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                fontSize: '0.75rem',
                                '&:hover': { 
                                  backgroundColor: '#dbeafe',
                                  transform: 'scale(1.02)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            />
                          )}
                          {item.is_low_stock && (
                            <Chip 
                              label="Low Stock" 
                              size="small" 
                              icon={<WarningIcon sx={{ fontSize: 14 }} />}
                              sx={{ 
                                fontWeight: '500',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                fontSize: '0.75rem',
                                '&:hover': { 
                                  backgroundColor: '#fee2e2',
                                  transform: 'scale(1.02)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: item.is_active ? '#10b981' : '#ef4444',
                          }} />
                          <Typography variant="caption" sx={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

      {/* Item Actions Menu */}
      <Menu
        anchorEl={itemMenuAnchor}
        open={Boolean(itemMenuAnchor)}
        onClose={() => setItemMenuAnchor(null)}
      >
        <MenuItem onClick={() => setItemMenuAnchor(null)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedItem && handleEditItem(selectedItem)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Item
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Item
        </MenuItem>
      </Menu>

      {/* Create Item Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog} 
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
            <InventoryIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ color: '#1f2937', mb: 0.5 }}>
              Create New Item
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Add item details, pricing, and inventory information
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
                <InventoryIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Basic Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  placeholder="Enter item name"
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
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Enter SKU (optional)"
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
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
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

          {/* Pricing Section */}
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
                <StoreIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Pricing Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Price *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Price"
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.cost_price}
                  helperText={formErrors.cost_price}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
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

          {/* Inventory Section */}
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
                <InventoryIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Inventory Management
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  inputProps={{ min: 0 }}
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
                  label="Minimum Quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.min_quantity}
                  helperText={formErrors.min_quantity}
                  inputProps={{ min: 0 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    input={<OutlinedInput label="Unit" />}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                      }
                    }}
                  >
                    <MenuItem value="PCS">PCS</MenuItem>
                    <MenuItem value="KG">KG</MenuItem>
                    <MenuItem value="LTR">LTR</MenuItem>
                    <MenuItem value="BOX">BOX</MenuItem>
                    <MenuItem value="PACK">PACK</MenuItem>
                    <MenuItem value="MTR">MTR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode (optional)"
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

          {/* Category & Status Section */}
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
                <CategoryIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#1f2937' }}>
                Category & Status
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    input={<OutlinedInput label="Category" />}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                      }
                    }}
                  >
                    <MenuItem value="">No Category</MenuItem>
                    {categoriesArray.map((category: string) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
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
                        Active Item
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable to make this item available for sale
                      </Typography>
                    </Box>
                  }
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
            onClick={handleCloseCreateDialog} 
            disabled={isSubmitting}
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
            variant="contained"
            onClick={handleFormSubmit}
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
                Creating Item...
              </Box>
            ) : (
              'Create Item'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon color="primary" />
            <Typography variant="h6">Edit Item</Typography>
      </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  placeholder="Enter item name"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Enter SKU (optional)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                />
              </Grid>

              {/* Pricing */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Pricing & Inventory
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Price *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Price"
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.cost_price}
                  helperText={formErrors.cost_price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>

              {/* Inventory */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Inventory Management
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
                  error={!!formErrors.min_quantity}
                  helperText={formErrors.min_quantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    input={<OutlinedInput label="Unit" />}
                  >
                    <MenuItem value="PCS">PCS</MenuItem>
                    <MenuItem value="KG">KG</MenuItem>
                    <MenuItem value="LTR">LTR</MenuItem>
                    <MenuItem value="BOX">BOX</MenuItem>
                    <MenuItem value="PACK">PACK</MenuItem>
                    <MenuItem value="MTR">MTR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode (optional)"
                />
              </Grid>

              {/* Category & Status */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Category & Status
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    input={<OutlinedInput label="Category" />}
                  >
                    <MenuItem value="">No Category</MenuItem>
                    {categoriesArray.map((category: string) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active Item"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEditFormSubmit}
            disabled={isSubmitting}
            startIcon={<EditIcon />}
          >
            {isSubmitting ? 'Updating...' : 'Update Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Import Items</DialogTitle>
        <DialogContent>
        <Typography color="text.secondary">
            Bulk import functionality will be implemented here.
        </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Import</Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => dispatch(clearError())}
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccessSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

        {/* Floating Action Button */}
        <Zoom in timeout={1500}>
          <Fab
            aria-label="add"
            onClick={() => {
              console.log('FAB Create item button clicked')
              setCreateDialogOpen(true)
            }}
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
        </Zoom>
      </Box>
    </Box>
  )
}

export default ItemsPage
