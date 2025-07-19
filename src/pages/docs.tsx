import React from 'react'
import { Box, Typography, Paper, Button, Grid, Card, CardContent, CardActions } from '@mui/material'
import { useRouter } from 'next/router'

const DocsPage = () => {
  const router = useRouter()

  const docsOptions = [
    {
      title: '🔥 Swagger UI',
      description: 'Interactive OpenAPI documentation with try-it-out functionality',
      features: [
        'Complete API specification',
        'Interactive testing',
        'Request/response examples',
        'Schema definitions'
      ],
      path: '/swagger',
      color: '#ff6b35'
    },
    {
      title: '📚 API Documentation',
      description: 'Custom documentation with live testing interface',
      features: [
        'Live API testing',
        'Multiple test scenarios',
        'Real-time responses',
        'User-friendly interface'
      ],
      path: '/api-docs',
      color: '#4ecdc4'
    }
  ]

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h3" gutterBottom align="center">
        📖 FCM API Documentation
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Choose your preferred documentation format
      </Typography>

      <Grid container spacing={3}>
        {docsOptions.map((option, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${option.color}`,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ color: option.color }}>
                  {option.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {option.description}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Features:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {option.features.map((feature, idx) => (
                    <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => router.push(option.path)}
                  sx={{ 
                    bgcolor: option.color,
                    '&:hover': {
                      bgcolor: option.color,
                      opacity: 0.9
                    }
                  }}
                >
                  Open Documentation
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Quick Start
        </Typography>
        <Typography variant="body2" paragraph>
          Your FCM API is ready to use! Here's a quick example:
        </Typography>
        <Box sx={{ bgcolor: 'black', color: 'white', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
          <Typography variant="body2" component="pre" sx={{ margin: 0 }}>
            {`curl -X POST http://localhost:3000/api/fcm/send/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "your_device_token",
    "notification": {
      "title": "Hello!",
      "body": "This is a test notification"
    }
  }'`}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default DocsPage 