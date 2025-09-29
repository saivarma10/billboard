import React from 'react'
import { Typography, Box, Button, Paper } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const BillsPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Bills
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Bill
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No bills found. Create your first bill to get started.
        </Typography>
      </Paper>
    </Box>
  )
}

export default BillsPage
