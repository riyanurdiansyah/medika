import { useState } from 'react'
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams 
} from '@mui/x-data-grid'
import { 
  Card, 
  CardHeader, 
  Button, 
  Box, 
  Chip, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { ProductOffer, ApprovalStatus } from 'src/types/productOffer'
import { productOfferService } from 'src/services/productOfferService'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'

interface OfferListProps {
  offers: ProductOffer[]
  loading: boolean
  onAddOffer?: () => void
  userRole?: string
  onRefresh: () => void
}

interface ApprovalDialogState {
  open: boolean
  offerId: string
  stepId: string
  status: ApprovalStatus | null
  comment: string
}

const defaultDialogState: ApprovalDialogState = {
  open: false,
  offerId: '',
  stepId: '',
  status: null,
  comment: ''
}

const OfferList = ({ offers, loading, onAddOffer, userRole, onRefresh }: OfferListProps) => {
  const { user } = useAuth()
  const [approvalDialog, setApprovalDialog] = useState<ApprovalDialogState>(defaultDialogState)
  const [submitting, setSubmitting] = useState(false)

  const handleApprovalAction = (
    offerId: string, 
    stepId: string, 
    status: ApprovalStatus
  ) => {
    setApprovalDialog({
      open: true,
      offerId,
      stepId,
      status,
      comment: ''
    })
  }

  const handleCloseDialog = () => {
    setApprovalDialog(defaultDialogState)
  }

  const handleSubmitApproval = async () => {
    if (!approvalDialog.status || !user) return

    try {
      setSubmitting(true)
      await productOfferService.updateApprovalStep(
        approvalDialog.offerId,
        approvalDialog.stepId,
        approvalDialog.status,
        user.fullName,
        approvalDialog.comment
      )
      toast.success(`Offer ${approvalDialog.status} successfully`)
      handleCloseDialog()
      onRefresh()
    } catch (err) {
      console.error('Error updating approval:', err)
      toast.error('Failed to update approval status')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.name}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {params.row.category}
          </Typography>
        </Box>
      )
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2'>
          ${params.row.price.toFixed(2)}
        </Typography>
      )
    },
    {
      field: 'submitterName',
      headerName: 'Submitted By',
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const statusColors: Record<ApprovalStatus, 'warning' | 'success' | 'error'> = {
          pending: 'warning',
          approved: 'success',
          rejected: 'error'
        }

        return (
          <Chip
            label={params.row.status}
            color={statusColors[params.row.status as ApprovalStatus]}
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
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const offer = params.row as ProductOffer
        
        // Find the current step that needs the user's role approval
        const currentStep = offer.approvalSteps.find(
          step => step.role === userRole && step.status === 'pending'
        )

        if (!currentStep || offer.status !== 'pending') {
          return null
        }

        return (
          <Box>
            <Button
              size="small"
              color="success"
              variant="tonal"
              onClick={() => handleApprovalAction(offer.id, currentStep.id, 'approved')}
              sx={{ mr: 2 }}
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              variant="tonal"
              onClick={() => handleApprovalAction(offer.id, currentStep.id, 'rejected')}
            >
              Reject
            </Button>
          </Box>
        )
      }
    }
  ]

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Typography variant='h5' sx={{ color: 'text.primary' }}>
              Product Offers
            </Typography>
          }
          action={
            onAddOffer && (
              <Button
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
                onClick={onAddOffer}
              >
                New Offer
              </Button>
            )
          }
          sx={{ pb: 4, '& .MuiCardHeader-title': { color: 'text.primary' } }}
        />
        <DataGrid
          rows={offers}
          columns={columns}
          loading={loading}
          autoHeight
          pagination
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterSelectedRowCount
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            border: 0,
            borderRadius: 1,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme => hexToRGBA(theme.palette.primary.main, 0.08),
              borderRadius: 1
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: theme => hexToRGBA(theme.palette.primary.main, 0.04)
              }
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider'
            }
          }}
        />
      </Card>

      <Dialog open={approvalDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {approvalDialog.status === 'approved' ? 'Approve' : 'Reject'} Offer
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={approvalDialog.comment}
            onChange={e => setApprovalDialog(prev => ({ ...prev, comment: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitApproval}
            color={approvalDialog.status === 'approved' ? 'success' : 'error'}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : (approvalDialog.status === 'approved' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default OfferList 