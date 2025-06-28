import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid'
import { Card, CardHeader, Chip, Button, IconButton, Box, Tooltip } from '@mui/material'
import { RequestFormM } from 'src/types/requestForm'
import Icon from 'src/@core/components/icon'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

interface RequestFormListProps {
  requests: RequestFormM[]
  loading: boolean
  userRole: string
  onViewRequest: (requestId: string) => void
  onAddRequest: () => void
  onApproveRequest: (requestId: string) => void
  onRejectRequest: (requestId: string) => void
  onResubmitRequest?: (requestId: string) => void
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

const RequestFormList = ({ 
  requests, 
  loading, 
  userRole,
  onViewRequest, 
  onAddRequest,
  onApproveRequest,
  onRejectRequest,
  onResubmitRequest
}: RequestFormListProps) => {
  const getStatusColor = (status: string): ChipColor => {
    const statusColors: Record<string, ChipColor> = {
      Submitted: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    }
    return statusColors[status] || 'default'
  }

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    }
    return statusLabels[status] || status
  }

  const canApprove = (request: RequestFormM): boolean => {
    // Check if any approval is pending
    const pendingApproval = request.approvals.find(approval => approval.status === 'pending')
    return !!pendingApproval
  }

  const columns: GridColDef<RequestFormM>[] = [
    { 
      field: 'noDokumen', 
      headerName: 'Document No', 
      flex: 1.5,
      minWidth: 150 
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<RequestFormM>) => (
        <Chip
          label={params.row.type}
          color="primary"
          size="medium"
        />
      )
    },
    { 
      field: 'alat', 
      headerName: 'Equipment', 
      flex: 1.5,
      minWidth: 150 
    },
    { 
      field: 'dtCreated', 
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
      field: 'approvalStatus',
      headerName: 'Status',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<RequestFormM>) => {
        // Get the latest approval status
        const latestApproval = params.row.approvals.length > 0 
          ? params.row.approvals[params.row.approvals.length - 1] 
          : null
        
        const status = latestApproval?.status || 'SUBMITTED'
        
        return (
          <Chip
            label={status}
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
      renderCell: (params: GridRenderCellParams<RequestFormM>) => {
        const isApprovalView = window.location.pathname.includes('/requests/approvals')
        const showApprovalButtons = isApprovalView && canApprove(params.row)
        const showResubmitButton = !isApprovalView && params.row.approvals.some(a => a.status === 'rejected') && onResubmitRequest
        
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
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

            {showResubmitButton && (
              <Tooltip title="Resubmit Request">
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onResubmitRequest(params.row.id)
                    }}
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.lighter',
                      '&:hover': {
                        bgcolor: 'primary.light'
                      }
                    }}
                  >
                    <Icon icon="tabler:refresh" />
                  </IconButton>
                </span>
              </Tooltip>
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

export default RequestFormList 