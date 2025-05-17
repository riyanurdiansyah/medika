import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid
} from '@mui/material'
import DirectSuperiorField from './DirectSuperiorField'
import { UserData, UserRole } from 'src/types/user'
import { userService } from 'src/services/userService'
import toast from 'react-hot-toast'

interface EditUserDialogProps {
  open: boolean
  user: UserData
  roles: UserRole[]
  onClose: () => void
  onUpdate: () => void
}

const EditUserDialog = ({ open, user, roles, onClose, onUpdate }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullname: user.fullname || '',
    email: user.email || '',
    role: user.role || '',
    directSuperior: user.directSuperior || ''
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await userService.updateUser(user.id!, {
        ...formData,
        status: user.status
      })
      toast.success('User updated successfully')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
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
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => {
                    const newRole = e.target.value
                    setFormData({ 
                      ...formData, 
                      role: newRole,
                      // Clear direct superior if changing from/to sales role
                      directSuperior: newRole === 'sales' ? '' : formData.directSuperior 
                    })
                  }}
                  disabled={loading}
                >
                  {roles
                    .filter(role => !role.isSystem) // Filter out system roles
                    .map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <DirectSuperiorField
                currentUser={user}
                value={formData.directSuperior}
                onChange={(value) => setFormData({ ...formData, directSuperior: value })}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !formData.email || !formData.fullname || !formData.role}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditUserDialog 