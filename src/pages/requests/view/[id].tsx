import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Button
} from '@mui/material'
import { format } from 'date-fns'
import { Request, RequestStatus } from 'src/types/request'
import { requestService } from 'src/services/requestService'
import { userService } from 'src/services/userService'
import PageHeader from 'src/@core/components/page-header'
import { UserData } from 'src/types/user'
import Icon from 'src/@core/components/icon'
import { RequestFormM } from 'src/types/requestForm'
import { useAuth } from 'src/hooks/useAuth'
import RequestFormDetailView from 'src/components/requests/RequestFormDetailView'
import { toast } from 'react-hot-toast'

const RequestFormView = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [request, setRequest] = useState<RequestFormM | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id || typeof id !== 'string') return

      try {
        setLoading(true)
        setError(null)
        
        // Use the Flutter-style function to get request by createdBy
        const requests = await requestService.getRequestsByCreatedBy(user?.username || '')
        const foundRequest = requests.find(req => req.id === id)
        
        if (!foundRequest) {
          setError('Request not found')
          return
        }
        
        setRequest(foundRequest)
      } catch (err) {
        console.error('Error fetching request:', err)
        setError('Failed to fetch request details')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id, user])

  const handleBack = () => {
    router.back()
  }

  const handleApprove = async () => {
    if (!request || !user) return

    try {
      // Implement approval logic here
      toast.success('Request approved successfully')
      router.back()
    } catch (err) {
      console.error('Error approving request:', err)
      toast.error('Failed to approve request')
    }
  }

  const handleReject = async () => {
    if (!request || !user) return

    try {
      // Implement rejection logic here
      toast.success('Request rejected successfully')
      router.back()
    } catch (err) {
      console.error('Error rejecting request:', err)
      toast.error('Failed to reject request')
    }
  }

  const handleRefresh = async () => {
    if (!id || typeof id !== 'string' || !user) return

    try {
      setLoading(true)
      setError(null)
      
      // Refresh the request data
      const requests = await requestService.getRequestsByCreatedBy(user.username || '')
      const foundRequest = requests.find(req => req.id === id)
      
      if (!foundRequest) {
        setError('Request not found')
        return
      }
      
      setRequest(foundRequest)
    } catch (err) {
      console.error('Error refreshing request:', err)
      setError('Failed to refresh request details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!request) {
    return <Alert severity="info">No request found</Alert>
  }

  // Check if user can approve this request
  const isApproval = user?.role === 'Supervisor' || user?.role === 'Manager' || user?.role === 'Deputy Manager'

  // Check if request is rejected
  const isRejected = request.approvals.length > 0 && 
    request.approvals[request.approvals.length - 1].status === 'rejected'

  const handleRevise = () => {
    router.push('/requests/edit/' + request.id)
  }

  return (
    <Box>
      {/* Revise Button for Rejected Requests */}
      {isRejected && (
        <Card sx={{ 
          mb: 3, 
          border: '2px dashed', 
          borderColor: 'warning.main', 
          bgcolor: 'warning.lighter' 
        }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
              Request Rejected - Ready for Revision
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              This request has been rejected. Click the button below to edit and submit a revision.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleRevise}
              startIcon={<Icon icon="tabler:edit" />}
              sx={{
                bgcolor: 'warning.main',
                '&:hover': { bgcolor: 'warning.dark' },
                py: 1.5,
                px: 4,
                fontWeight: 600
              }}
            >
              Edit & Revise Request
            </Button>
          </CardContent>
        </Card>
      )}

      <RequestFormDetailView
        data={request}
        isApproval={isApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onBack={handleBack}
        onRefresh={handleRefresh}
      />
    </Box>
  )
}

export default RequestFormView 