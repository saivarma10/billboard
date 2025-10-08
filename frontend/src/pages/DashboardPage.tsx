import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Button,
  Chip,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon2,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../store/store'
import { fetchShops } from '../store/slices/shopSlice'
import { fetchBills } from '../store/slices/billSlice'
import { fetchItems } from '../store/slices/itemSlice'
import { fetchCustomers } from '../store/slices/customerSlice'

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const loading = useSelector((state: RootState) => (state.shop as any)?.loading || false)
  const [refreshing, setRefreshing] = useState(false)

  // Get data from Redux store
  const shops = useSelector((state: RootState) => (state.shop as any)?.shops || [])
  const bills = useSelector((state: RootState) => (state.bill as any)?.bills || [])
  const items = useSelector((state: RootState) => (state.item as any)?.items || [])
  const customers = useSelector((state: RootState) => (state.customer as any)?.customers || [])
  
  // Get the first shop ID for API calls
  const currentShopId = shops.length > 0 ? shops[0].id : ''

  useEffect(() => {
    // Fetch shops first, then other data
    dispatch(fetchShops())
  }, [dispatch])

  // Fetch other data when shop is available
  useEffect(() => {
    if (currentShopId) {
      dispatch(fetchBills({ shopId: currentShopId }))
      dispatch(fetchItems({ shopId: currentShopId }))
      dispatch(fetchCustomers({ shopId: currentShopId }))
    }
  }, [dispatch, currentShopId])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        dispatch(fetchShops()),
        ...(currentShopId ? [
          dispatch(fetchBills({ shopId: currentShopId })),
          dispatch(fetchItems({ shopId: currentShopId })),
          dispatch(fetchCustomers({ shopId: currentShopId }))
        ] : [])
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const stats = [
    {
      title: 'Total Bills',
      value: bills.length.toString(),
      change: '+0%',
      changeType: 'neutral',
      icon: <ReceiptIcon />,
      color: '#3b82f6',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lightBg: '#eff6ff',
    },
    {
      title: 'Total Items',
      value: items.length.toString(),
      change: '+0%',
      changeType: 'neutral',
      icon: <InventoryIcon />,
      color: '#059669',
      bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      lightBg: '#ecfdf5',
    },
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      change: '+0%',
      changeType: 'neutral',
      icon: <PeopleIcon />,
      color: '#d97706',
      bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      lightBg: '#fffbeb',
    },
    {
      title: 'Pending Amount',
      value: '₹0',
      change: '+0%',
      changeType: 'neutral',
      icon: <MoneyIcon />,
      color: '#dc2626',
      bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      lightBg: '#fef2f2',
    },
  ]

  const quickActions = [
    { 
      title: 'Create New Bill', 
      description: 'Generate a new invoice',
      icon: <ReceiptIcon />, 
      color: '#3b82f6',
      path: '/bills',
      onClick: () => navigate('/bills')
    },
    { 
      title: 'Add Item', 
      description: 'Add new product',
      icon: <InventoryIcon />, 
      color: '#059669',
      path: '/items',
      onClick: () => navigate('/items')
    },
    { 
      title: 'Add Customer', 
      description: 'Register new customer',
      icon: <PeopleIcon />, 
      color: '#d97706',
      path: '/customers',
      onClick: () => navigate('/customers')
    },
    { 
      title: 'View Reports', 
      description: 'Analytics & insights',
      icon: <AssessmentIcon />, 
      color: '#7c3aed',
      path: '/dashboard',
      onClick: () => navigate('/dashboard')
    },
  ]

  // Generate recent activity from actual data
  const recentActivity = [
    ...bills.slice(0, 2).map((bill: any, index: number) => ({
      id: `bill-${bill.id || index}`,
      action: 'New bill created',
      customer: bill.customer_name || 'Unknown Customer',
      amount: `₹${bill.total_amount || 0}`,
      time: 'Recently',
      type: 'bill'
    })),
    ...customers.slice(0, 1).map((customer: any, index: number) => ({
      id: `customer-${customer.id || index}`,
      action: 'Customer added',
      customer: customer.name || 'Unknown Customer',
      amount: '',
      time: 'Recently',
      type: 'customer'
    })),
    ...items.slice(0, 1).map((item: any, index: number) => ({
      id: `item-${item.id || index}`,
      action: 'Item updated',
      customer: item.name || 'Unknown Item',
      amount: `₹${item.price || 0}`,
      time: 'Recently',
      type: 'item'
    }))
  ].slice(0, 4) // Limit to 4 items

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }


  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <Box sx={{ 
        maxWidth: '1400px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 }
      }}>
        <Fade in timeout={800}>
          <Box>
            {/* Dashboard Header */}
            <Box sx={{ 
              mb: { xs: 3, sm: 4, md: 5 },
              p: { xs: 2, sm: 3, md: 4 },
              background: 'white',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 3,
                minHeight: { xs: 'auto', sm: '60px' }
              }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    fontWeight="700" 
                    sx={{
                      color: '#1f2937',
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  >
                    Dashboard
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#6b7280',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.5,
                    }}
                  >
                    Manage your billing operations efficiently.
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={handleRefresh} 
                      disabled={refreshing}
                      sx={{
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        width: 44,
                        height: 44,
                        '&:hover': {
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          transform: 'rotate(180deg)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <RefreshIcon sx={{ 
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${bills.length} Bills`}
                      size="small"
                      sx={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        fontWeight: '500',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Chip 
                      label={`${items.length} Items`}
                      size="small"
                      sx={{
                        backgroundColor: '#f0fdf4',
                        color: '#059669',
                        border: '1px solid #bbf7d0',
                        fontWeight: '500',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Chip 
                      label={`${customers.length} Customers`}
                      size="small"
                      sx={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        border: '1px solid #fde68a',
                        fontWeight: '500',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
      
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in timeout={1000 + index * 200}>
                    <Card
                      sx={{
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
                      }}
                    >
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

            <Grid container spacing={3}>
              {/* Quick Actions */}
              <Grid item xs={12} md={4}>
                <Fade in timeout={1200}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    height: '100%', 
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" fontWeight="bold">
                        Quick Actions
                      </Typography>
                      <Chip 
                        label="Fast Access" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ 
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                          color: '#667eea',
                        }}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      {quickActions.map((action, index) => (
                        <Grid item xs={12} key={index}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={action.icon}
                            onClick={action.onClick}
                            sx={{
                              py: 2,
                              px: 3,
                              borderRadius: 2,
                              borderColor: action.color,
                              color: action.color,
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: `${action.color}15`,
                                borderColor: action.color,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 20px ${action.color}30`,
                              },
                            }}
                          >
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="body2" fontWeight="600">
                                {action.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {action.description}
                              </Typography>
                            </Box>
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

              {/* Recent Activity */}
              <Grid item xs={12} md={8}>
                <Fade in timeout={1400}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    height: '100%', 
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" fontWeight="bold">
                        Recent Activity
                      </Typography>
                      <Chip 
                        label={`${recentActivity.length} Activities`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ 
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                          color: '#667eea',
                        }}
                      />
                    </Box>
                    {recentActivity.length > 0 ? (
                      <Box>
                        {recentActivity.map((activity) => (
                          <Box 
                            key={activity.id}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              p: 2, 
                              mb: 2, 
                              borderRadius: 2,
                              background: 'rgba(102, 126, 234, 0.05)',
                              border: '1px solid rgba(102, 126, 234, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.1)',
                                transform: 'translateX(4px)',
                              }
                            }}
                          >
                            <Avatar sx={{ 
                              bgcolor: activity.type === 'bill' ? '#3b82f6' : 
                                      activity.type === 'customer' ? '#d97706' : 
                                      activity.type === 'item' ? '#059669' : '#7c3aed',
                              width: 40, 
                              height: 40, 
                              mr: 2 
                            }}>
                              {activity.type === 'bill' ? <ReceiptIcon /> :
                               activity.type === 'customer' ? <PeopleIcon /> :
                               activity.type === 'item' ? <InventoryIcon /> : <MoneyIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="600">
                                {activity.action}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {activity.customer}
                                {activity.amount && ` • ${activity.amount}`}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: 4,
                          textAlign: 'center',
                        }}
                      >
                        <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No recent activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Start creating bills, adding customers, or managing items
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/bills')}
                          sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                          }}
                        >
                          Get Started
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

              {/* Sales Chart Placeholder */}
              <Grid item xs={12}>
                <Fade in timeout={1600}>
                  <Card sx={{ 
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                  }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" fontWeight="bold">
                        Sales Overview
                      </Typography>
                      <Chip 
                        label="Coming Soon" 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ 
                          borderColor: 'rgba(156, 163, 175, 0.3)',
                          color: '#6b7280',
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        height: 300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        }
                      }}
                    >
                      <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
                        <TrendingUpIcon2 sx={{ 
                          fontSize: 64, 
                          color: '#667eea', 
                          mb: 2,
                          opacity: 0.7
                        }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Interactive Analytics Coming Soon
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Beautiful charts and insights will be displayed here
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AssessmentIcon />}
                          sx={{
                            borderRadius: 2,
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              borderColor: '#5a6fd8',
                            },
                          }}
                        >
                          View Analytics
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default DashboardPage
