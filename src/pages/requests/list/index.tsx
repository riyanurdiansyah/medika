// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Alert } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestList from 'src/components/requests/RequestList'
import { useRequests } from 'src/hooks/useRequests'
import { useAuth } from 'src/hooks/useAuth'

const MyRequestsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { requests, loading, error, refreshRequests } = useRequests()

  const handleViewRequest = (requestId: string) => {
    router.push(`/requests/view/${requestId}`)
  }

  const handleAddRequest = () => {
    router.push('/requests/submit')
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
        <RequestList
          requests={requests}
          loading={loading}
          userRole={user?.role || ''}
          onViewRequest={handleViewRequest}
          onAddRequest={handleAddRequest}
          onApproveRequest={() => {}} // Not used in my requests view
          onRejectRequest={() => {}} // Not used in my requests view
        />
      </Grid>
    </Grid>
  )
}

export default MyRequestsPage 