// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Alert } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestFormList from 'src/components/requests/RequestFormList'
import { useRequestsByCreatedBy } from 'src/hooks/useRequests'
import { useAuth } from 'src/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { requestService } from 'src/services/requestService'

const MyRequestsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { requests, loading, error, refreshRequests } = useRequestsByCreatedBy()

  const handleViewRequest = (requestId: string) => {
    router.push(`/requests/view/${requestId}`)
  }

  const handleAddRequest = () => {
    router.push('/requests/submit')
  }

  const handleResubmitRequest = async (requestId: string) => {
    try {
      await requestService.resubmitRequest(requestId)
      toast.success('Request resubmitted successfully')
      refreshRequests()
    } catch (err) {
      console.error('Error resubmitting request:', err)
      toast.error('Failed to resubmit request')
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>My Requests</h5>}
        subtitle={<>View and manage your requests</>}
      />
      <Grid item xs={12}>
        <RequestFormList
          requests={requests}
          loading={loading}
          userRole={user?.role || ''}
          onViewRequest={handleViewRequest}
          onAddRequest={handleAddRequest}
          onApproveRequest={() => {}} // Not used in my requests view
          onRejectRequest={() => {}} // Not used in my requests view
          onResubmitRequest={handleResubmitRequest}
        />
      </Grid>
    </Grid>
  )
}

export default MyRequestsPage 