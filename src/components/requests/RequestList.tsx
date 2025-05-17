import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid'
import { Card, CardHeader, Chip, Button, IconButton, Box, Tooltip } from '@mui/material'
import { Request, RequestStatus } from 'src/types/request'
import Icon from 'src/@core/components/icon'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

interface RequestListProps {
  requests: Request[]
  loading: boolean
  userRole: string
  onViewRequest: (requestId: string) => void
  onAddRequest: () => void
  onApproveRequest: (requestId: string) => void
  onRejectRequest: (requestId: string) => void
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

const RequestList = ({ 
  requests, 
  loading, 
  userRole,
  onViewRequest, 
  onAddRequest,
  onApproveRequest,
  onRejectRequest 
}: RequestListProps) => {
  const getStatusColor = (status: RequestStatus): ChipColor => {
    const statusColors: Record<RequestStatus, ChipColor> = {
      pending: 'warning',
      approved_supervisor: 'info',
      approved_manager: 'info',
      approved_deputy: 'info',
      rejected: 'error',
      completed: 'success'
    }
    return statusColors[status]
  }

  const getStatusLabel = (status: RequestStatus): string => {
    const statusLabels: Record<RequestStatus, string> = {
      pending: 'Pending',
      approved_supervisor: 'Approved by Supervisor',
      approved_manager: 'Approved by Manager',
      approved_deputy: 'Approved by Deputy',
      rejected: 'Rejected',
      completed: 'Completed'
    }
    return statusLabels[status]
  }

  const canApprove = (request: Request): boolean => {
    const approvalLevels = {
      'Supervisor': 1,
      'Manager': 2,
      'Deputy Manager': 3
    }

    const userApprovalLevel = approvalLevels[userRole as keyof typeof approvalLevels] || 0
    return userApprovalLevel === request.currentApprovalLevel && request.status !== 'rejected'
  }

  const columns: GridColDef<Request>[] = [
    { 
      field: 'title', 
      headerName: 'Title', 
      flex: 2,
      minWidth: 200 
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Request>) => (
        <Chip
          label={params.value?.charAt(0).toUpperCase() + params.value?.slice(1)}
          color="primary"
          size="small"
        />
      )
    },
    { 
      field: 'requesterName', 
      headerName: 'Requester', 
      flex: 1.5,
      minWidth: 150 
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1.5,
      minWidth: 180,
      valueFormatter: (params) => {
        if (params.value instanceof Timestamp) {
          return format(params.value.toDate(), 'MMM dd yyyy HH:mm')
        }
        return '-'
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Request>) => {
        const status = params.row.status
        return (
          <Chip
            label={getStatusLabel(status)}
            color={getStatusColor(status)}
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
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Request>) => {
        const showApprovalButtons = canApprove(params.row)
        
        return (
          <Box>
            <Tooltip title="View Details">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewRequest(params.row.id)
                  }}
                  color="primary"
                >
                  <Icon icon="tabler:eye" />
                </IconButton>
              </span>
            </Tooltip>
            
            {showApprovalButtons && (
              <>
                <Tooltip title="Approve">
                  <span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onApproveRequest(params.row.id)
                      }}
                      color="success"
                    >
                      <Icon icon="tabler:check" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reject">
                  <span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRejectRequest(params.row.id)
                      }}
                      color="error"
                    >
                      <Icon icon="tabler:x" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        )
      }
    }
  ]

  return (
    <Card>
      <CardHeader 
        title='Requests'
        action={
          userRole === 'Sales' && (
            <Button
              variant="contained"
              startIcon={<Icon icon="tabler:plus" />}
              onClick={onAddRequest}
            >
              New Request
            </Button>
          )
        }
      />
      <DataGrid
        rows={requests}
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

export default RequestList 