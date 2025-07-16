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
  Chip,
  Grid,
  Paper,
  TextField
} from '@mui/material'
import { RequestFormM } from 'src/types/requestForm'
import { requestService } from 'src/services/requestService'
import Icon from 'src/@core/components/icon'
import { useAuth } from 'src/hooks/useAuth'
import BasicInfoRequestForm from 'src/components/requests/BasicInfoRequestForm'
import { toast } from 'react-hot-toast'
import { exportTrialReport } from 'src/utils/exportTrialReport'
import PageHeader from 'src/@core/components/page-header'

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

  const handleGenerateReport = async () => {
    if (request) {
      await exportTrialReport(request)
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
      <Grid container spacing={6}>
        <PageHeader
          title={<h5>Edit Request</h5>}
          subtitle={`Update request details • GUID: ${request.id} • Type: ${request.type}`}
        />
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Chip
              label={request.approvals.length > 0 ? request.approvals[request.approvals.length - 1].status : 'Pending'}
              color={request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'APPROVED' ? 'success' : 
                     request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'REJECTED' ? 'error' : 'warning'}
              sx={{ fontWeight: 600 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
                startIcon={<Icon icon="tabler:x" />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave(request)}
                disabled={saving}
                startIcon={<Icon icon="tabler:check" />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Basic Information
            </Typography>
            
                         <Grid container spacing={3}>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="No Dokumen"
                   value={request.noDokumen || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, noDokumen: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Tanggal Dokumen"
                   type="date"
                   value={request.tanggal ? (request.tanggal as any).toDate().toISOString().split('T')[0] : ''}
                   onChange={(e) => {
                     const date = e.target.value ? new Date(e.target.value) : null
                     setRequest(prev => prev ? { ...prev, tanggal: date as any } : null)
                   }}
                   InputLabelProps={{ shrink: true }}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Alamat"
                   multiline
                   rows={3}
                   value={request.alamat || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, alamat: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="No Telepon"
                   value={request.noTelepon || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, noTelepon: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Kepala Laboratorium"
                   value={request.namaKepalaLab || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, namaKepalaLab: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Penanggung Jawab Alat"
                   value={request.penanggungJawabAlat || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, penanggungJawabAlat: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Tanggal Pengajuan Form"
                   type="date"
                   value={request.tanggalPengajuan ? (request.tanggalPengajuan as any).toDate().toISOString().split('T')[0] : ''}
                   onChange={(e) => {
                     const date = e.target.value ? new Date(e.target.value) : null
                     setRequest(prev => prev ? { ...prev, tanggalPengajuan: date as any } : null)
                   }}
                   InputLabelProps={{ shrink: true }}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Alat"
                   value={request.alat || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, alat: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Merk"
                   value={request.merk || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, merk: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Serial Number"
                   value={request.serialNumber || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, serialNumber: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="No SPK/Invoice"
                   value={request.noInvoice || ''}
                   onChange={(e) => setRequest(prev => prev ? { ...prev, noInvoice: e.target.value } : null)}
                   sx={{ mb: 2 }}
                 />
               </Grid>
             </Grid>
           </Paper>

           {/* Items Section */}
           <Paper 
             elevation={0}
             sx={{ 
               mt: 3,
               p: 3,
               border: '1px solid',
               borderColor: 'divider'
             }}
           >
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                 Items
               </Typography>
               <Button 
                 variant="outlined" 
                 onClick={() => setRequest(prev => prev ? { 
                   ...prev, 
                   items: [...prev.items, { id: '', namaItem: '', jumlah: 0, satuan: '', status: '' }]
                 } : null)}
                 startIcon={<Icon icon="tabler:plus" />}
               >
                 Add Item
               </Button>
             </Box>
             
             {request.items.map((item, index) => (
               <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                 <Grid item xs={3}>
                   <TextField
                     label="Nama Item"
                     value={item.namaItem}
                     onChange={(e) => {
                       const newItems = [...request.items]
                       newItems[index] = { ...newItems[index], namaItem: e.target.value }
                       setRequest(prev => prev ? { ...prev, items: newItems } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     label="Jumlah"
                     type="number"
                     value={item.jumlah}
                     onChange={(e) => {
                       const newItems = [...request.items]
                       newItems[index] = { ...newItems[index], jumlah: parseInt(e.target.value) || 0 }
                       setRequest(prev => prev ? { ...prev, items: newItems } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     label="Satuan"
                     value={item.satuan}
                     onChange={(e) => {
                       const newItems = [...request.items]
                       newItems[index] = { ...newItems[index], satuan: e.target.value }
                       setRequest(prev => prev ? { ...prev, items: newItems } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={3}>
                   <TextField
                     label="Status"
                     value={item.status || ''}
                     onChange={(e) => {
                       const newItems = [...request.items]
                       newItems[index] = { ...newItems[index], status: e.target.value }
                       setRequest(prev => prev ? { ...prev, items: newItems } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2} display="flex" alignItems="center">
                   <Button
                     variant="outlined"
                     color="error"
                     onClick={() => {
                       const newItems = [...request.items]
                       newItems.splice(index, 1)
                       setRequest(prev => prev ? { ...prev, items: newItems } : null)
                     }}
                     startIcon={<Icon icon="tabler:trash" />}
                   >
                     Remove
                   </Button>
                 </Grid>
               </Grid>
             ))}
           </Paper>

           {/* Accessories Section */}
           <Paper 
             elevation={0}
             sx={{ 
               mt: 3,
               p: 3,
               border: '1px solid',
               borderColor: 'divider'
             }}
           >
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                 Accessories
               </Typography>
               <Button 
                 variant="outlined" 
                 onClick={() => setRequest(prev => prev ? { 
                   ...prev, 
                   accesories: [...prev.accesories, { id: '', namaItem: '', jumlah: 0, satuan: '', status: '' }]
                 } : null)}
                 startIcon={<Icon icon="tabler:plus" />}
               >
                 Add Accessory
               </Button>
             </Box>
             
             {request.accesories.map((item, index) => (
               <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                 <Grid item xs={3}>
                   <TextField
                     label="Nama Item"
                     value={item.namaItem}
                     onChange={(e) => {
                       const newAccessories = [...request.accesories]
                       newAccessories[index] = { ...newAccessories[index], namaItem: e.target.value }
                       setRequest(prev => prev ? { ...prev, accesories: newAccessories } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     label="Jumlah"
                     type="number"
                     value={item.jumlah}
                     onChange={(e) => {
                       const newAccessories = [...request.accesories]
                       newAccessories[index] = { ...newAccessories[index], jumlah: parseInt(e.target.value) || 0 }
                       setRequest(prev => prev ? { ...prev, accesories: newAccessories } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2}>
                   <TextField
                     label="Satuan"
                     value={item.satuan}
                     onChange={(e) => {
                       const newAccessories = [...request.accesories]
                       newAccessories[index] = { ...newAccessories[index], satuan: e.target.value }
                       setRequest(prev => prev ? { ...prev, accesories: newAccessories } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={3}>
                   <TextField
                     label="Status"
                     value={item.status || ''}
                     onChange={(e) => {
                       const newAccessories = [...request.accesories]
                       newAccessories[index] = { ...newAccessories[index], status: e.target.value }
                       setRequest(prev => prev ? { ...prev, accesories: newAccessories } : null)
                     }}
                     fullWidth
                   />
                 </Grid>
                 <Grid item xs={2} display="flex" alignItems="center">
                   <Button
                     variant="outlined"
                     color="error"
                     onClick={() => {
                       const newAccessories = [...request.accesories]
                       newAccessories.splice(index, 1)
                       setRequest(prev => prev ? { ...prev, accesories: newAccessories } : null)
                     }}
                     startIcon={<Icon icon="tabler:trash" />}
                   >
                     Remove
                   </Button>
                 </Grid>
                              </Grid>
             ))}
           </Paper>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Request Details</h5>}
        subtitle={`View and manage request details • GUID: ${request.id} • Type: ${request.type}`}
      />
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Chip
            label={request.approvals.length > 0 ? request.approvals[request.approvals.length - 1].status : 'Pending'}
            color={request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'APPROVED' ? 'success' : 
                   request.approvals.length > 0 && request.approvals[request.approvals.length - 1].status === 'REJECTED' ? 'error' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            
            {request && (
              <Button
                variant="outlined"
                color="success"
                onClick={handleGenerateReport}
                startIcon={<Icon icon="tabler:file-spreadsheet" />}
              >
                Generate Report
              </Button>
            )}
          </Box>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Basic Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No Dokumen</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noDokumen || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tanggal Dokumen</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {request.tanggal ? new Date(request.tanggal as any).toLocaleDateString() : '-'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Alamat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.alamat || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No Telepon</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noTelepon || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Kepala Laboratorium</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.namaKepalaLab || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Penanggung Jawab Alat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.penanggungJawabAlat || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tanggal Pengajuan Form</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {request.tanggalPengajuan ? new Date(request.tanggalPengajuan as any).toLocaleDateString() : '-'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Alat</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.alat || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Merk</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.merk || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.serialNumber || '-'}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">No SPK/Invoice</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{request.noInvoice || '-'}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Approval History */}
        {request.approvals.length > 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              mt: 3,
              p: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
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
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

export default RequestDetailPage 