// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Alert, Card, CardContent, Typography, Button, Box } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestFormList from 'src/components/requests/RequestFormList'
import { useAuth } from 'src/hooks/useAuth'
import { useRequestsForApprovals } from 'src/hooks/useRequestsForApprovals'
import { requestService } from 'src/services/requestService'

const FlutterStyleApprovalsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { requests, users, loading, error, refreshRequests } = useRequestsForApprovals()

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
        title={<h5>Flutter-Style Request Approvals</h5>}
        subtitle={<>Using the Flutter-style getRequests() function for approvals</>}
      />
      
      {/* Debug Information */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Debug Information
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Current User ID: {user?.id || 'Not logged in'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Users: {users.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requests for Approval: {requests.length}
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                <strong>Flutter Logic Applied:</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" component="div">
                1. Get all users (equivalent to _dC.users in Flutter)
                <br />
                2. Get usernames from users array
                <br />
                3. Query requests where createdBy is in usernames list
                <br />
                4. Filter based on approval logic:
                <br />
                &nbsp;&nbsp;• If approvals empty → check if user's directSuperior matches current user
                <br />
                &nbsp;&nbsp;• If last approval is REJECTED → discard
                <br />
                &nbsp;&nbsp;• If last approval is final status → discard
                <br />
                &nbsp;&nbsp;• Check if last approver's directSuperior matches current user
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

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

export default FlutterStyleApprovalsPage 