// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Alert } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestFormList from 'src/components/requests/RequestFormList'
import { useAuth } from 'src/hooks/useAuth'
import { useRequestsForApprovals } from 'src/hooks/useRequestsForApprovals'
import { requestService } from 'src/services/requestService'

const ApprovalsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { requests, loading, error, refreshRequests } = useRequestsForApprovals()

  const handleViewRequest = (requestId: string) => {
    router.push(`/requests/detail/${requestId}`)
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return

    try {
      await requestService.submitRequest(
        requests.find(r => r.id === requestId)!,
        'APPROVED',
        user.username || user.fullname
      )
      // Refresh the requests list
      refreshRequests()
    } catch (err) {
      console.error('Error approving request:', err)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return

    try {
      await requestService.submitRequest(
        requests.find(r => r.id === requestId)!,
        'REJECTED',
        user.username || user.fullname
      )
      // Refresh the requests list
      refreshRequests()
    } catch (err) {
      console.error('Error rejecting request:', err)
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Request Approvals</h5>}
        subtitle={<>Review and approve pending requests</>}
      />
      <Grid item xs={12}>
        <RequestFormList
          requests={requests}
          loading={loading}
          userRole={user?.role || ''}
          onViewRequest={handleViewRequest}
          onAddRequest={() => {}} // Not used in approvals view
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      </Grid>
    </Grid>
  )
}

export default ApprovalsPage 