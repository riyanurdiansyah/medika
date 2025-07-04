import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material'
import UserList from 'src/components/users/UserList'
import { useUsers } from 'src/hooks/useUsers'
import { userService } from 'src/services/userService'
import { roleService } from 'src/services/roleService'
import { useApprovalLevels } from 'src/hooks/useApprovalLevels'
import { UserRole } from 'src/types/user'
import toast from 'react-hot-toast'

interface UserFormData {
  email: string
  fullname: string
  password: string
  role: string
  directSuperior?: string
}

const defaultFormData: UserFormData = {
  email: '',
  fullname: '',
  password: '',
  role: 'subscriber',
  directSuperior: ''
}

const UsersPage = () => {
  const router = useRouter()
  const { users, loading: loadingUsers, error, refreshUsers } = useUsers()
  const { levels, loading: loadingLevels, getHigherLevelRoles } = useApprovalLevels()
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Get eligible superiors based on selected role
  const getEligibleSuperiors = () => {
    if (formData.role === 'sales') {
      const higherRoles = getHigherLevelRoles('sales')
      return users.filter(user => higherRoles.includes(user.role))
    }
    return users
  }

  // Fetch roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true)
        const fetchedRoles = await roleService.getAllRoles()
        setRoles(fetchedRoles)
      } catch (err) {
        console.error('Error fetching roles:', err)
        toast.error('Failed to load roles')
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && !['Super Admin', 'admin'].includes(user.role)) {
      router.push(`/users/${userId}`)
    }
  }

  const handleAddUser = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData(defaultFormData)
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || ['super-admin', 'admin'].includes(user.role)) return

    try {
      setSubmitting(true)
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await userService.updateUser(userId, { status: newStatus })
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      refreshUsers()
    } catch (err) {
      console.error('Error updating user status:', err)
      toast.error('Failed to update user status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!formData.email || !formData.fullname || !formData.password) {
        toast.error('Please fill in all required fields')
        return
      }

      // For sales role, direct superior is required
      if (formData.role === 'sales' && !formData.directSuperior) {
        toast.error('Direct superior is required for sales role')
        return
      }

      await userService.createUser({
        email: formData.email,
        fullname: formData.fullname,
        role: formData.role,
        status: 'active',
        password: formData.password,
        directSuperior: formData.directSuperior,
        avatar: null
      })

      toast.success('User created successfully')
      handleCloseDialog()
      refreshUsers()
    } catch (err) {
      console.error('Error creating user:', err)
      toast.error('Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const isLoading = loadingUsers || loadingRoles || loadingLevels

  return (
    <>
      <UserList 
        users={users}
        roles={roles}
        loading={isLoading}
        onUserSelect={handleUserSelect}
        onAddUser={handleAddUser}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={submitting}
              sx={{ mb: 4 }}
              required
            />
            <TextField
              fullWidth
              label="Full Name"
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              disabled={submitting}
              sx={{ mb: 4 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={submitting}
              sx={{ mb: 4 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 4 }}>
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
                disabled={submitting || loadingRoles}
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

            {/* Direct Superior field - only shown and required for sales role */}
            {formData.role === 'sales' && (
              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Direct Superior</InputLabel>
                <Select
                  value={formData.directSuperior || ''}
                  label="Direct Superior"
                  onChange={(e) => setFormData({ ...formData, directSuperior: e.target.value })}
                  disabled={submitting}
                  required
                >
                  {getEligibleSuperiors().map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.fullname} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={
              submitting || 
              !formData.email || 
              !formData.fullname || 
              !formData.password || 
              loadingRoles ||
              (formData.role === 'sales' && !formData.directSuperior) // Disable if sales role without superior
            }
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// Add ACL configuration
UsersPage.acl = {
  action: 'manage',
  subject: 'users'
}

export default UsersPage