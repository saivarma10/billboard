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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        pointerEvents: 'none',
      }
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        }
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Stunning Header with Glass Morphism */}
        <Fade in timeout={800}>
          <Paper elevation={0} sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
            }
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                }}>
                  <InventoryIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h4" fontWeight="bold">
                    Inventory Hub
                  </Typography>
                </Box>
                
                <Box display="flex" gap={2}>
                  <Tooltip title="Total Items">
                    <Chip
                      icon={<StoreIcon />}
                      label={`${items.length} Items`}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 'bold',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Low Stock Alert">
                    <Chip
                      icon={<WarningIcon />}
                      label={`${lowStockCount} Low Stock`}
                      color="error"
                      variant="filled"
                      sx={{ 
                        fontWeight: 'bold',
                        animation: lowStockCount > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.05)' },
                          '100%': { transform: 'scale(1)' },
                        }
                      }}
                    />
                  </Tooltip>
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
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      '&:hover': {
                        transform: 'rotate(180deg)',
                        background: 'linear-gradient(135deg, #764ba2, #667eea)',
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
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Import
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleBulkExport}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                    transition: 'all 0.3s ease'
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
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2, #667eea)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create New Item
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Advanced Search and Filter Section */}
        <Slide direction="down" in timeout={1000}>
          <Paper elevation={0} sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            p: 3,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}>
            <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
              {/* Advanced Search with Autocomplete */}
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
                            <SearchIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.9)',
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
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
              
              {/* Advanced Filter Toggle */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderColor: 'primary.main',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Filters
              </Button>
              
              {/* View Mode Toggle */}
              <Box display="flex" gap={1}>
                <Tooltip title="Grid View">
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    sx={{
                      background: viewMode === 'grid' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : 'primary.main',
                      '&:hover': {
                        background: viewMode === 'grid' ? 'linear-gradient(135deg, #764ba2, #667eea)' : 'rgba(102, 126, 234, 0.1)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <GridIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="List View">
                  <IconButton
                    onClick={() => setViewMode('list')}
                    sx={{
                      background: viewMode === 'list' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'primary.main',
                      '&:hover': {
                        background: viewMode === 'list' ? 'linear-gradient(135deg, #764ba2, #667eea)' : 'rgba(102, 126, 234, 0.1)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Sort Options */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="created_at">Date Added</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    background: 'linear-gradient(135deg, #764ba2, #667eea)',
                  },
                  transition: 'all 0.3s ease'
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
                    color="error"
                    variant="filled"
                    icon={<WarningIcon />}
                    sx={{ 
                      fontWeight: 'bold',
                      '&:hover': { transform: 'scale(1.05)' },
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
                    color="primary"
                    variant="filled"
                    icon={<CategoryIcon />}
                    sx={{ 
                      fontWeight: 'bold',
                      '&:hover': { transform: 'scale(1.05)' },
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
                    color="secondary"
                    variant="filled"
                    icon={<SearchIcon />}
                    sx={{ 
                      fontWeight: 'bold',
                      '&:hover': { transform: 'scale(1.05)' },
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

        {/* Stunning Items Display */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={index * 100}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
              <Box sx={{
                p: 4,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                }
              }}>
                <InventoryIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary" mb={2}>
                {filters.search || filters.category || filters.lowStock
                  ? 'No items match your filters'
                  : 'Your inventory is empty'}
              </Typography>
              <Typography color="text.secondary" mb={4} sx={{ maxWidth: 400, mx: 'auto' }}>
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
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2, #667eea)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
                  },
                  transition: 'all 0.3s ease'
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
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        '& .item-actions': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                        '& .item-gradient': {
                          opacity: 1,
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: item.is_low_stock 
                          ? 'linear-gradient(90deg, #ff6b6b, #ee5a24)'
                          : 'linear-gradient(90deg, #667eea, #764ba2)',
                        opacity: 0.8,
                      }
                    }}
                  >
                    {/* Animated Gradient Overlay */}
                    <Box
                      className="item-gradient"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
                      {/* Header with Actions */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flexGrow={1} minWidth={0}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 1,
                            }}
                          >
                            {item.description || 'No description available'}
                          </Typography>
                          {item.sku && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              SKU: {item.sku}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box className="item-actions" sx={{
                          opacity: 0,
                          transform: 'translateY(-10px)',
                          transition: 'all 0.3s ease',
                        }}>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setSelectedItem(item)
                                setItemMenuAnchor(e.currentTarget)
                              }}
                              sx={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                  color: 'white',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Price and Quantity */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
    <Box>
                          <Typography variant="h5" fontWeight="bold" sx={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>
                            ₹{item.price.toFixed(2)}
        </Typography>
                          {item.cost_price && item.cost_price > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Cost: ₹{item.cost_price.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box textAlign="right">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              Stock:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={item.is_low_stock ? 'error.main' : 'text.primary'}
                              fontWeight="bold"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
                                background: item.is_low_stock 
                                  ? 'rgba(244, 67, 54, 0.1)' 
                                  : 'rgba(76, 175, 80, 0.1)',
                              }}
                            >
                              {item.quantity} {item.unit}
                            </Typography>
                          </Box>
                          {item.min_quantity > 0 && (
                            <Typography variant="caption" color="text.secondary">
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
                              color="primary" 
                              variant="outlined"
                              icon={<CategoryIcon />}
                              sx={{ 
                                fontWeight: 'bold',
                                '&:hover': { transform: 'scale(1.05)' },
                                transition: 'all 0.2s ease'
                              }}
                            />
                          )}
                          {item.is_low_stock && (
                            <Chip 
                              label="Low Stock" 
                              size="small" 
                              color="error" 
                              variant="filled"
                              icon={<WarningIcon />}
                              sx={{ 
                                fontWeight: 'bold',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.05)' },
                                  '100%': { transform: 'scale(1)' },
                                }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: item.is_active 
                              ? 'linear-gradient(135deg, #4caf50, #8bc34a)'
                              : 'linear-gradient(135deg, #f44336, #ff9800)',
                            boxShadow: `0 0 10px ${item.is_active ? '#4caf50' : '#f44336'}`,
                          }} />
                          <Typography variant="caption" color="text.secondary">
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
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" />
            <Typography variant="h6">Create New Item</Typography>
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
          <Button onClick={handleCloseCreateDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              console.log('Current form data:', formData)
              console.log('Current shop ID:', currentShop?.id)
              console.log('Form errors:', formErrors)
            }}
            sx={{ mr: 1 }}
          >
            Debug
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            startIcon={<AddIcon />}
          >
            {isSubmitting ? 'Creating...' : 'Create Item'}
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

        {/* Stunning Floating Action Button */}
        <Zoom in timeout={1500}>
          <Fab
            aria-label="add"
            onClick={() => {
              console.log('FAB Create item button clicked')
              setCreateDialogOpen(true)
            }}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              width: 64,
              height: 64,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2, #667eea)',
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-5px)' },
              }
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Zoom>
      </Box>
    </Box>
  )
}

export default ItemsPage
