// ** React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Alert } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestList from 'src/components/requests/RequestList'
import { Request } from 'src/types/request'
import { useAuth } from 'src/hooks/useAuth'
import { requestService } from 'src/services/requestService'

const ApprovalsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        console.log('No user found in auth context')
        return
      }

      console.log('Current user role:', user.role)
      
      try {
        setLoading(true)
        const data = await requestService.getPendingApprovals(user.role)
        console.log('Fetched requests:', data)
        setRequests(data)
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError('Failed to fetch requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const handleViewRequest = (requestId: string) => {
    router.push(`/requests/view/${requestId}`)
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return

    try {
      await requestService.approveRequest(
        requestId,
        user.id,
        user.fullname,
        user.role
      )
      // Refresh the requests list
      const updatedRequests = await requestService.getPendingApprovals(user.role)
      setRequests(updatedRequests)
    } catch (err) {
      console.error('Error approving request:', err)
      setError('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return

    try {
      await requestService.rejectRequest(
        requestId,
        user.id,
        user.fullname,
        user.role
      )
      // Refresh the requests list
      const updatedRequests = await requestService.getPendingApprovals(user.role)
      setRequests(updatedRequests)
    } catch (err) {
      console.error('Error rejecting request:', err)
      setError('Failed to reject request')
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
        <RequestList
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