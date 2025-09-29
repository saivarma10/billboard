import React from 'react'
import { Typography, Box, Paper } from '@mui/material'

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Settings page coming soon.
        </Typography>
      </Paper>
    </Box>
  )
}

export default SettingsPage
