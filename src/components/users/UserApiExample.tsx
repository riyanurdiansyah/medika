import React, { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material'
import { userApi } from 'src/utils/api'
import { UserData } from 'src/types/user'

const UserApiExample: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const allUsers = await userApi.getAllUsers()
      setUsers(allUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await userApi.deleteUser(userId)
      // Refresh the user list after deletion
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Users from Firebase API</Typography>
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Total Users: {users.length}
            </Typography>
            
            {users.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No users found
              </Typography>
            ) : (
              <Box>
                {users.map((user) => (
                  <Box 
                    key={user.id} 
                    p={2} 
                    border={1} 
                    borderColor="divider" 
                    borderRadius={1}
                    mb={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {user.fullname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email} • Role: {user.role} • Status: {user.status}
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteUser(user.id!)}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default UserApiExample 