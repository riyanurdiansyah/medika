// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import { Card, CardHeader } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { IconButton, Box, Chip, Button, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import UserDialog from 'src/components/users/UserDialog'

// ** Firebase Imports
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from 'src/configs/firebase'

interface User {
  id: string
  username: string
  email: string
  fullname: string
  displayName: string
  role: string
  status: 'active' | 'inactive'
  directSuperior?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null)

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('username'))
      const querySnapshot = await getDocs(q)
      
      const fetchedUsers: User[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User))

      setUsers(fetchedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setDialogMode('edit')
      setDialogOpen(true)
    }
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setDialogMode('add')
    setDialogOpen(true)
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const userRef = doc(db, 'users', userId)
      
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })

      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleDialogSubmit = async (formData: {
    username: string
    email: string
    fullname: string
    role: string
    directSuperior?: string
  }) => {
    try {
      if (dialogMode === 'edit' && selectedUser?.id) {
        // Update existing user
        const userRef = doc(db, 'users', selectedUser.id)
        await updateDoc(userRef, {
          ...formData,
          updatedAt: serverTimestamp()
        })
      }
      // For 'add' mode, the UserDialog component handles the creation process

      await fetchUsers() // Refresh the list
      setDialogOpen(false)
    } catch (error) {
      console.error('Error saving user:', error)
      throw error // Let the dialog handle the error display
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    fetchUsers() // Refresh the list when dialog closes (in case changes were made)
  }

  const columns: GridColDef[] = [
    { 
      field: 'username', 
      headerName: 'Username', 
      flex: 1.5,
      minWidth: 150 
    },
    { 
      field: 'fullname', 
      headerName: 'Full Name', 
      flex: 2,
      minWidth: 200 
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 2,
      minWidth: 200 
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          sx={{ 
            height: 24,
            fontSize: '0.75rem',
            textTransform: 'capitalize',
            '& .MuiChip-label': { px: 1.5, lineHeight: 1.385 }
          }}
        />
      )
    },
    {
      field: 'directSuperior',
      headerName: 'Direct Superior',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        // Find the superior user from the users array
        const superior = users.find(u => u.id === params.row.directSuperior)
        if (!superior) return '-'
        
        return (
          <Chip
            label={superior.fullname || superior.displayName || 'Unnamed User'}
            color="default"
            size="small"
            sx={{ 
              height: 24,
              fontSize: '0.75rem',
              '& .MuiChip-label': { px: 1.5, lineHeight: 1.385 }
            }}
          />
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const isActive = params.value === 'active'
        
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'error'}
            sx={{ 
              height: 24,
              fontSize: '0.75rem',
              textTransform: 'capitalize',
              '& .MuiChip-label': { px: 1.5, lineHeight: 1.385 }
            }}
          />
        )
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => {
        const timestamp = params.row.createdAt as Timestamp
        return timestamp?.toDate().toLocaleString() || '-'
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isActive = params.row.status === 'active'
        
        return (
          <Box>
            <Tooltip title="Edit">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleEditUser(params.row.id)}
                  color="primary"
                >
                  <Icon icon="tabler:edit" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleToggleStatus(params.row.id, params.row.status)}
                  color={isActive ? 'error' : 'success'}
                >
                  <Icon icon={isActive ? 'tabler:user-off' : 'tabler:user-check'} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )
      }
    }
  ]

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>User Management</h5>}
        subtitle={<>Manage system users and their access</>}
      />
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Users'
            action={
              <Button
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            }
          />
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            autoHeight
            pagination
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            sx={{
              '& .MuiDataGrid-root': {
                width: '100%'
              }
            }}
          />
        </Card>
      </Grid>

      <UserDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialData={selectedUser || undefined}
        mode={dialogMode}
      />
    </Grid>
  )
}

export default UserManagementPage 