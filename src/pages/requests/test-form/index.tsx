import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import BasicInfoRequestForm from 'src/components/requests/BasicInfoRequestForm'
import { RequestFormM } from 'src/types/requestForm'

const TestFormPage = () => {
  const handleSubmit = (data: Partial<RequestFormM>) => {
    console.log('Form submitted:', data)
    alert('Form submitted! Check console for data.')
  }

  const handleNext = (data: Partial<RequestFormM>) => {
    console.log('Next clicked:', data)
    alert('Next clicked! Check console for data.')
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 2 }}>
      <Paper 
        elevation={0}
        sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          p: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Test BasicInfoRequestForm Component
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          This page demonstrates the Flutter-style form component transformed to Next.js.
          The form includes all the same fields as the original Flutter BasicInfoRequest widget.
        </Typography>

        <BasicInfoRequestForm
          onSubmit={handleSubmit}
          onNext={handleNext}
          loading={false}
        />
      </Paper>
    </Box>
  )
}

export default TestFormPage 