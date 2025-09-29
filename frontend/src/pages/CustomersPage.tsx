import React from 'react'
import { Typography, Box, Button, Paper } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const CustomersPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No customers found. Add your first customer to get started.
        </Typography>
      </Paper>
    </Box>
  )
}

export default CustomersPage
