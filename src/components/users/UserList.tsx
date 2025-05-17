import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Chip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import EditUserDialog from './EditUserDialog'
import { UserData, UserRole } from 'src/types/user'

interface UserListProps {
  users: UserData[]
  roles: UserRole[]
  loading: boolean
  onUserSelect: (userId: string) => void
  onAddUser: () => void
  onToggleStatus: (userId: string, currentStatus: string) => void
}

const UserList = ({ users, roles, loading, onUserSelect, onAddUser, onToggleStatus }: UserListProps) => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user)
  }

  const handleCloseEdit = () => {
    setSelectedUser(null)
  }

  return (
    <>
      <Card>
        <CardHeader 
          title="Users" 
          action={
            <Button
              variant="contained"
              onClick={onAddUser}
              startIcon={<Icon icon="tabler:plus" />}
            >
              Add User
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Direct Superior</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => {
                  const superior = users.find(u => u.id === user.directSuperior)
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{superior ? superior.fullName : '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={user.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEditClick(user)}
                          disabled={loading || ['Super Admin', 'admin'].includes(user.role)}
                        >
                          <Icon icon="tabler:edit" />
                        </IconButton>
                        <IconButton
                          onClick={() => onToggleStatus(user.id!, user.status)}
                          disabled={loading || ['Super Admin', 'admin'].includes(user.role)}
                        >
                          <Icon 
                            icon={user.status === 'active' ? 'tabler:toggle-right' : 'tabler:toggle-left'} 
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserDialog
          open={true}
          user={selectedUser}
          roles={roles}
          onClose={handleCloseEdit}
          onUpdate={onUserSelect}
        />
      )}
    </>
  )
}

export default UserList 