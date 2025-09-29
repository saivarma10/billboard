import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Button,
} from '@mui/material'
import {
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../store/store'
import { fetchShops } from '../store/slices/shopSlice'

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector((state: RootState) => (state.shop as any)?.loading || false)

  useEffect(() => {
    dispatch(fetchShops())
  }, [dispatch])

  const stats = [
    {
      title: 'Total Bills',
      value: '0',
      icon: <ReceiptIcon />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      title: 'Total Items',
      value: '0',
      icon: <InventoryIcon />,
      color: '#059669',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Total Customers',
      value: '0',
      icon: <PeopleIcon />,
      color: '#d97706',
      bgColor: '#fffbeb',
    },
    {
      title: 'Pending Amount',
      value: '₹0',
      icon: <MoneyIcon />,
      color: '#dc2626',
      bgColor: '#fef2f2',
    },
  ]

  const quickActions = [
    { title: 'Create New Bill', icon: <ReceiptIcon />, color: '#3b82f6' },
    { title: 'Add Item', icon: <InventoryIcon />, color: '#059669' },
    { title: 'Add Customer', icon: <PeopleIcon />, color: '#d97706' },
    { title: 'View Reports', icon: <TrendingUpIcon />, color: '#7c3aed' },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your billing operations efficiently.
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: stat.bgColor,
                color: stat.color,
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%', border: '1px solid #e5e7eb' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={action.icon}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        borderColor: action.color,
                        color: action.color,
                        '&:hover': {
                          backgroundColor: `${action.color}15`,
                          borderColor: action.color,
                        },
                      }}
                    >
                      {action.title}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bills */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '100%', border: '1px solid #e5e7eb' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Bills
              </Typography>
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
                <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No bills found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create your first bill to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  sx={{
                    borderRadius: 2,
                    background: '#3b82f6',
                    '&:hover': {
                      background: '#2563eb',
                    },
                  }}
                >
                  Create First Bill
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Chart Placeholder */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales Overview
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                }}
              >
                <Box textAlign="center">
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Sales Chart Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interactive charts will be displayed here
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
