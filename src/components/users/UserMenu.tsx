import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography
} from '@mui/material'
import DirectSuperiorField from './DirectSuperiorField'
import { UserData } from 'src/types/user'
import { userService } from 'src/services/userService'
import toast from 'react-hot-toast'

interface UserMenuProps {
  user: UserData
  onUpdate?: () => void
}

const UserMenu = ({ user, onUpdate }: UserMenuProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullname: user.fullname || '',
    email: user.email || '',
    directSuperior: user.directSuperior || ''
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await userService.updateUser(user.id!, {
        ...formData,
        role: user.role,
        status: user.status
      })
      toast.success('User information updated successfully')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user information')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title="User Information" />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <DirectSuperiorField
              currentUser={user}
              value={formData.directSuperior}
              onChange={(value) => setFormData({ ...formData, directSuperior: value })}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Role: {user.role}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Status: {user.status}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default UserMenu 