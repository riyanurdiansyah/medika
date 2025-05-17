// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestList from 'src/components/requests/RequestList'
import { Request } from 'src/types/request'

const MyRequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleViewRequest = (requestId: string) => {
    // Implement view request logic
    console.log('View request:', requestId)
  }

  const handleAddRequest = () => {
    // Implement add request logic
    console.log('Add new request')
  }

  const handleApproveRequest = (requestId: string) => {
    // Implement approve request logic
    console.log('Approve request:', requestId)
  }

  const handleRejectRequest = (requestId: string) => {
    // Implement reject request logic
    console.log('Reject request:', requestId)
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
          userRole="Sales"
          onViewRequest={handleViewRequest}
          onAddRequest={handleAddRequest}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      </Grid>
    </Grid>
  )
}

export default MyRequestsPage 