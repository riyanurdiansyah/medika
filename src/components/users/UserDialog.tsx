import { useState, useEffect } from 'react'
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
  Grid,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { UserRole, UserData } from 'src/types/user'
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from 'src/configs/firebase'
import { useUsers } from 'src/hooks/useUsers'

interface UserFormData {
  username: string
  email: string
  fullname: string
  role: string
  password?: string
  directSuperior?: string
  id?: string
}

interface UserDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => Promise<void>
  initialData?: Partial<UserFormData>
  mode: 'add' | 'edit'
}

const UserDialog = ({ open, onClose, onSubmit, initialData, mode }: UserDialogProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: initialData?.username || '',
    email: initialData?.email || '',
    fullname: initialData?.fullname || '',
    role: initialData?.role || '',
    password: '',
    directSuperior: initialData?.directSuperior || '',
    id: initialData?.id
  })
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { users } = useUsers()
  const [approvalLevels, setApprovalLevels] = useState<{ level: number, role: string }[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    } else {
      // Reset form when dialog opens for new user
      setFormData({
        username: '',
        email: '',
        fullname: '',
        role: '',
        password: '',
        directSuperior: '',
        id: undefined
      })
    }
  }, [initialData, open])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRef = collection(db, 'roles')
        const snapshot = await getDocs(rolesRef)
        const rolesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserRole[]
        setRoles(rolesList)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }

    if (open) {
      fetchRoles()
    }
  }, [open])

  // Fetch approval levels from Firestore
  useEffect(() => {
    const fetchApprovalLevels = async () => {
      try {
        const approvalSettingsRef = doc(db, 'settings', 'approvalFlow')
        const approvalSettingsDoc = await getDoc(approvalSettingsRef)
        
        if (approvalSettingsDoc.exists()) {
          setApprovalLevels(approvalSettingsDoc.data().levels)
        }
      } catch (error) {
        console.error('Error fetching approval levels:', error)
      }
    }

    fetchApprovalLevels()
  }, [])

  const handleChange = (field: keyof UserFormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) return 'Username is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.fullname.trim()) return 'Full Name is required'
    if (!formData.role) return 'Role is required'
    if (mode === 'add' && !formData.password?.trim()) return 'Password is required'
    if (mode === 'add' && formData.password!.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  // Get eligible superiors based on approval levels
  const getEligibleSuperiors = () => {
    // Get selected role's level from approval hierarchy
    const selectedRoleLevel = approvalLevels.find(
      level => level.role.toLowerCase() === formData.role.toLowerCase()
    )?.level || 0

    // Filter users with higher level roles than the selected role
    return users
      .filter((user: UserData) => {
        // Don't show the current user being edited
        if (user.id === formData.id) return false
        
        // Get the user's role level from approval hierarchy
        const userRoleLevel = approvalLevels.find(
          level => level.role.toLowerCase() === user.role.toLowerCase()
        )?.level || 0

        // Only show users with higher level than the selected role
        return userRoleLevel > selectedRoleLevel
      })
      .sort((a, b) => a.fullname.localeCompare(b.fullname))
  }

  const handleSubmit = async () => {
    try {
      const validationError = validateForm()
      if (validationError) {
        setError(validationError)
        return
      }

      setError('')
      setLoading(true)

      if (mode === 'add') {
        // Create Firebase Auth user first
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password!)
        
        // If auth creation successful, create Firestore document
        const userData = {
          uid: userCredential.user.uid,
          username: formData.username,
          email: formData.email,
          fullname: formData.fullname,
          role: formData.role,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        // Store in Firestore using the auth UID as document ID
        await setDoc(doc(db, 'users', userCredential.user.uid), userData)
      }

      // Call parent's onSubmit for edit mode or additional handling
      await onSubmit(formData)
      onClose()
    } catch (error: any) {
      console.error('Error creating user:', error)
      setError(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>{mode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange('username')}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullname}
              onChange={handleChange('fullname')}
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled={mode === 'edit' || loading}
            />
          </Grid>
          {mode === 'add' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                disabled={loading}
                helperText="Password must be at least 6 characters"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => {
                  const newRole = e.target.value
                  setFormData({ 
                    ...formData, 
                    role: newRole,
                    // Clear direct superior when role changes
                    directSuperior: ''
                  })
                }}
                disabled={loading}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Show Direct Superior field when a role is selected */}
          {formData.role && (
            <Grid item xs={12}>
              <Autocomplete
                options={getEligibleSuperiors()}
                getOptionLabel={(option: UserData) => `${option.fullname} (${option.role})`}
                value={users.find(user => user.id === formData.directSuperior) || null}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    directSuperior: newValue?.id || ''
                  })
                }}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Direct Superior"
                    placeholder="Search by name"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{option.fullname}</div>
                      <div style={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {option.role}
                      </div>
                    </div>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                clearOnBlur={false}
                clearOnEscape
                handleHomeEndKeys
                selectOnFocus
                clearText="Clear selection"
                noOptionsText="No eligible superiors found"
              />
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <p style={{ color: 'red', margin: 0 }}>{error}</p>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDialog 