import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid'
import { Card, CardHeader, Chip, Button, IconButton, Box, Tooltip } from '@mui/material'
import { UserRole } from 'src/types/user'
import Icon from 'src/@core/components/icon'
import { format, isValid } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

interface RoleListProps {
  roles: UserRole[]
  loading: boolean
  onRoleSelect: (roleId: string) => void
  onAddRole: () => void
  onToggleStatus: (roleId: string, currentStatus: string) => void
}

type RoleStatus = 'active' | 'inactive'
type ChipColor = 'success' | 'error'

const RoleList = ({ roles, loading, onRoleSelect, onAddRole, onToggleStatus }: RoleListProps) => {
  const columns: GridColDef<UserRole>[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 2,
      minWidth: 150 
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 3,
      minWidth: 200 
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 2,
      minWidth: 180,
      valueFormatter: (params) => {
        try {
          if (!params.value) return '-'
          
          // Handle Firestore Timestamp
          if (params.value instanceof Timestamp) {
            return format(params.value.toDate(), 'MMM dd yyyy HH:mm')
          }
          
          return '-'
        } catch (error) {
          console.error('Date formatting error:', error)
          return '-'
        }
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<UserRole>) => {
        const statusColor: Record<RoleStatus, ChipColor> = {
          active: 'success',
          inactive: 'error'
        }
        const status = (params.row.status || 'active') as RoleStatus

        return (
          <Chip
            label={status}
            color={statusColor[status]}
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
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<UserRole>) => {
        const isSystemRole = params.row.isSystem
        const isActive = params.row.status === 'active'
        
        return (
          <Box>
            <Tooltip title="Edit">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRoleSelect(params.row.id)
                  }}
                  disabled={isSystemRole}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(params.row.id, params.row.status || 'active')
                  }}
                  disabled={isSystemRole}
                  color={isActive ? 'error' : 'success'}
                >
                  <Icon icon={isActive ? 'tabler:shield-off' : 'tabler:shield-check'} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )
      }
    }
  ]

  return (
    <Card>
      <CardHeader 
        title='Roles'
        action={
          <Button
            variant="contained"
            startIcon={<Icon icon="tabler:plus" />}
            onClick={() => {
              console.log('Add Role button clicked')
              onAddRole()
            }}
          >
            Add Role
          </Button>
        }
      />
      <DataGrid
        rows={roles}
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
  )
}

export default RoleList 