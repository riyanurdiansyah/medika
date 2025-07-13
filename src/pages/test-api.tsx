import { NextPage } from 'next'
import UserApiExample from 'src/components/users/UserApiExample'
import { Card, CardContent, Typography, Box } from '@mui/material'

const TestApiPage: NextPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Testing Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This page demonstrates the Firebase User API functionality using the example component.
      </Typography>
      
      <UserApiExample />
      
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Endpoints Available:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li><strong>GET /api/users</strong> - Get all users</li>
            <li><strong>GET /api/users/[id]</strong> - Get specific user</li>
            <li><strong>PUT /api/users/[id]</strong> - Update user</li>
            <li><strong>DELETE /api/users/[id]</strong> - Delete user</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TestApiPage 