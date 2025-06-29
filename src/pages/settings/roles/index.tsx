// ** React Imports
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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material'
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RoleList from 'src/components/roles/RoleList'
import { useRoles } from 'src/hooks/useRoles'
import { useLevels } from 'src/hooks/useLevels'
import { roleService } from 'src/services/roleService'
import { UserRole } from 'src/types/user'
import toast from 'react-hot-toast'

interface RoleFormData {
  name: string
  description: string
  status: boolean
}

const defaultFormData: RoleFormData = {
  name: '',
  description: '',
  status: true
}

const RoleManagementPage = () => {
  const router = useRouter()
  const { roles, loading: rolesLoading, error: rolesError, refreshRoles } = useRoles()
  const { levels, loading: levelsLoading, error: levelsError } = useLevels()
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<RoleFormData>(defaultFormData)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role && !role.isSystem) {
      setSelectedRole(role)
      setFormData({
        name: role.name,
        description: role.description,
        status: role.status === 'active'
      })
      setOpenDialog(true)
    }
  }

  const handleAddRole = () => {
    console.log('handleAddRole called')
    setSelectedRole(null)
    setFormData(defaultFormData)
    setOpenDialog(true)
    console.log('openDialog set to true')
  }

  const handleCloseDialog = () => {
    console.log('handleCloseDialog called')
    setOpenDialog(false)
    setSelectedRole(null)
    setFormData(defaultFormData)
  }

  useEffect(() => {
    console.log('openDialog state changed:', openDialog)
  }, [openDialog])

  const handleToggleStatus = async (roleId: string, currentStatus: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role || role.isSystem) return

    try {
      setSubmitting(true)
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await roleService.updateRole(roleId, { status: newStatus })
      toast.success(`Role ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      refreshRoles()
    } catch (err) {
      console.error('Error updating role status:', err)
      toast.error('Failed to update role status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!formData.name || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      if (selectedRole) {
        // Update existing role
        await roleService.updateRole(selectedRole.id, {
          name: formData.name,
          description: formData.description,
          status: formData.status ? 'active' : 'inactive'
        })
        toast.success('Role updated successfully')
      } else {
        // Create new role
        await roleService.createRole({
          name: formData.name,
          description: formData.description,
          isSystem: false,
          permissions: [],
          guid: '', // This will be overwritten by roleService with a generated GUID
          status: formData.status ? 'active' : 'inactive',
          level: '1' // Default level
        })
        toast.success('Role created successfully')
      }

      handleCloseDialog()
      refreshRoles()
    } catch (err) {
      console.error('Error saving role:', err)
      toast.error('Failed to save role')
    } finally {
      setSubmitting(false)
    }
  }

  if (rolesError || levelsError) {
    return <Alert severity="error">{rolesError || levelsError}</Alert>
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Role Management</h5>}
        subtitle={<>Manage system roles and their permissions</>}
      />
      <Grid item xs={12}>
        <RoleList
          roles={roles}
          levels={levels}
          loading={rolesLoading}
          onRoleSelect={handleRoleSelect}
          onAddRole={handleAddRole}
          onToggleStatus={handleToggleStatus}
        />

        {/* Edit/Create Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            {selectedRole ? 'Edit Role' : 'Add New Role'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="Role Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
                sx={{ mb: 4 }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                disabled={submitting}
                required
                sx={{ mb: 4 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    disabled={submitting}
                  />
                }
                label="Status (Active/Inactive)"
                sx={{ mb: 2 }}
              />
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
              disabled={submitting || !formData.name || !formData.description}
            >
              {submitting ? 'Saving...' : selectedRole ? 'Update Role' : 'Add Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default RoleManagementPage 