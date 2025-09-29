import React from 'react'
import { Typography, Box, Button, Paper } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const ItemsPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No items found. Add your first item to get started.
        </Typography>
      </Paper>
    </Box>
  )
}

export default ItemsPage
