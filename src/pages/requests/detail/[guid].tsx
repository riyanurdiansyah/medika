import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Button,
  Chip
} from '@mui/material'
import { RequestFormM } from 'src/types/requestForm'
import { requestService } from 'src/services/requestService'
import Icon from 'src/@core/components/icon'
import { useAuth } from 'src/hooks/useAuth'
import BasicInfoRequestForm from 'src/components/requests/BasicInfoRequestForm'
import { toast } from 'react-hot-toast'

const RequestDetailPage = () => {
  const router = useRouter()
  const { guid } = router.query
  const { user } = useAuth()
  const [request, setRequest] = useState<RequestFormM | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!guid || typeof guid !== 'string') return

      try {
        setLoading(true)
        setError(null)
        
        // Try to get request by GUID first
        let foundRequest: RequestFormM | null = null
        
        try {
          // Try to get by ID (GUID)
          foundRequest = await requestService.getRequestById(guid) as any
        } catch (err) {
          console.log('Request not found by ID, trying by createdBy...')
        }
        
        if (!foundRequest && user?.username) {
          // Fallback: get by createdBy and find by GUID
          const requests = await requestService.getRequestsByCreatedBy(user.username)
          foundRequest = requests.find(req => req.id === guid) || null
        }
        
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
  }, [guid, user])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async (formData: Partial<RequestFormM>) => {
    if (!request) return

    try {
      setSaving(true)
      
      const updatedRequest: RequestFormM = {
        ...request,
        ...formData
      }

      await requestService.updateRequestForm(updatedRequest)
      
      setRequest(updatedRequest)
      setIsEditing(false)
      toast.success('Request updated successfully')
    } catch (err) {
      console.error('Error updating request:', err)
      toast.error('Failed to update request')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!request || !user) return

    try {
      await requestService.submitRequest(
        request,
        'APPROVED',
        user.username || user.fullname
      )
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
      await requestService.submitRequest(
        request,
        'REJECTED',
        user.username || user.fullname
      )
      toast.success('Request rejected successfully')
      router.back()
    } catch (err) {
      console.error('Error rejecting request:', err)
      toast.error('Failed to reject request')
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
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<Icon icon="tabler:arrow-left" />}
        >
          Go Back
        </Button>
      </Box>
    )
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No request found
        </Alert>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<Icon icon="tabler:arrow-left" />}
        >
          Go Back
        </Button>
      </Box>
    )
  }

  // Check if user can approve this request
  const isApproval = user?.role === 'Supervisor' || user?.role === 'Manager' || user?.role === 'Deputy Manager'

  // Check if request is rejected
  const isRejected = request.approvals.length > 0 && 
    request.approvals[request.approvals.length - 1].status === 'REJECTED'

  // If editing, show the form
  if (isEditing) {
    return (
      <BasicInfoRequestForm
        data={request}
        onSubmit={handleSave}
        isEdit={true}
        loading={saving}
      />
    )
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<Icon icon="tabler:arrow-left" />}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Request Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              GUID: {request.id} • Type: {request.type}
            </Typography>
          </Box>
          <Chip
            label={request.approvals.length > 0 ? request.approvals[request.approvals.length - 1].status : 'Pending'}
            color={request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'APPROVED' ? 'success' : 
                   request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'REJECTED' ? 'error' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleEdit}
            startIcon={<Icon icon="tabler:edit" />}
          >
            Edit Request
          </Button>
          
          {isApproval && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                startIcon={<Icon icon="tabler:check" />}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleReject}
                startIcon={<Icon icon="tabler:x" />}
              >
                Reject
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Basic Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No Dokumen</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noDokumen || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tanggal Dokumen</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {request.tanggal ? new Date(request.tanggal as any).toLocaleDateString() : '-'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Alamat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.alamat || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No Telepon</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noTelepon || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Kepala Laboratorium</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.namaKepalaLab || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Penanggung Jawab Alat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.penanggungJawabAlat || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tanggal Pengajuan Form</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {request.tanggalPengajuan ? new Date(request.tanggalPengajuan as any).toLocaleDateString() : '-'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Alat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.alat || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Merk</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.merk || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.serialNumber || '-'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No SPK/Invoice</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noInvoice || '-'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Approval History */}
        {request.approvals.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Approval History
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {request.approvals.map((approval, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <Chip
                      label={approval.status}
                      color={approval.status === 'APPROVED' ? 'success' : 
                             approval.status === 'REJECTED' ? 'error' : 'warning'}
                      size="small"
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {approval.nama}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {approval.tanggal ? new Date(approval.tanggal as any).toLocaleString() : '-'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default RequestDetailPage 