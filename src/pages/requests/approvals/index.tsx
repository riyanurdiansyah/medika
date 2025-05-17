// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestList from 'src/components/requests/RequestList'
import { Request } from 'src/types/request'

const ApprovalsPage = () => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [userRole] = useState<string>('Supervisor') // This should come from auth context

  const handleViewRequest = (requestId: string) => {
    // Implement view request logic
    console.log('View request:', requestId)
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
        title={<h5>Request Approvals</h5>}
        subtitle={<>Review and approve pending requests</>}
      />
      <Grid item xs={12}>
        <RequestList
          requests={requests}
          loading={loading}
          userRole={userRole}
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