import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Paper,
  IconButton,
  Stack,
  Avatar,
  Badge,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import { RequestFormM } from 'src/types/requestForm'
import Icon from 'src/@core/components/icon'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import { requestService } from 'src/services/requestService'

interface RequestFormDetailViewProps {
  data: RequestFormM
  isApproval?: boolean
  onReject?: () => void
  onApprove?: () => void
  onBack?: () => void
  onRefresh?: () => void
}

const RequestFormDetailView: React.FC<RequestFormDetailViewProps> = ({
  data,
  isApproval = false,
  onReject,
  onApprove,
  onBack,
  onRefresh
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  
  // Helper functions
  const formatDate = (ts?: Timestamp): string => {
    if (!ts) return "-"
    return format(ts.toDate(), 'dd MMM yyyy')
  }

  const formatDateWithTime = (ts?: Timestamp): string => {
    if (!ts) return "-"
    return format(ts.toDate(), 'dd MMM yyyy HH:mm:ss')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      case 'REVISED': return 'info'
      default: return 'default'
    }
  }

  const handleSubmit = async (type: 'APPROVED' | 'REJECTED' | 'REVISED') => {
    try {
      const res = await requestService.submitRequest(data, type, user?.username ?? '-')

      if (res.success) {
        setOpenSnackbar(true)
      } else {
        alert('Error: ' + (res.message || 'Gagal submit'))
      }
    } catch (error: any) {
      alert('Error saat submit: ' + error.message || error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'tabler:check-circle'
      case 'rejected': return 'tabler:x-circle'
      case 'pending': return 'tabler:clock'
      case 'REVISED': return 'tabler:edit-circle'
      default: return 'tabler:minus-circle'
    }
  }

  const isRejected = data.approvals.length > 0 && 
    data.approvals[data.approvals.length - 1].status === 'rejected'

  // Info Card Component
  const InfoCard = ({ 
    title, 
    children, 
    icon,
    color = 'primary'
  }: { 
    title: string
    children: React.ReactNode
    icon: string
    color?: string
  }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 2,
          borderColor: `${color}.main`
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              width: 40,
              height: 40,
              mr: 2
            }}
          >
            <Icon icon={icon} fontSize={20} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  )

  // Info Row Component (for non-editable fields)
  const InfoRow = ({ 
    label, 
    value, 
    icon,
    color = 'text.secondary'
  }: { 
    label: string
    value: string
    icon?: string
    color?: string
  }) => {
    if (!value || value === "-") return null
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2, 
        p: 1.5, 
        borderRadius: 1, 
        bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
        border: theme => theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: 'divider'
      }}>
        {icon && (
          <Box sx={{ color: 'text.disabled', mr: 1.5 }}>
            <Icon icon={icon} fontSize={16} />
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500, display: 'block' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    )
  }

  // Approval Timeline Component
  const ApprovalTimeline = ({ approvals }: { approvals: any[] }) => (
    <Box sx={{ mt: 2 }}>
      {approvals.map((approval, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ position: 'relative', mr: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: `${getStatusColor(approval.status)}.lighter`,
                color: `${getStatusColor(approval.status)}.main`
              }}
            >
              <Icon icon={getStatusIcon(approval.status)} fontSize={16} />
            </Avatar>
            {index < approvals.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 32,
                  width: 2,
                  height: 20,
                  bgcolor: 'divider',
                  transform: 'translateX(-50%)'
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {approval.nama}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {formatDateWithTime(approval.tanggal)}
            </Typography>
            <Chip
              label={approval.status}
              size="small"
              color={getStatusColor(approval.status) as any}
              sx={{ mt: 0.5, textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Simple Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onBack}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Icon icon="tabler:arrow-left" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Request Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Document #{data.noDokumen} • {data.type}
            </Typography>
          </Box>
          <Chip
            label={data.approvals.length > 0 ? data.approvals[data.approvals.length - 1].status : 'Pending'}
            color={getStatusColor(data.approvals.length > 0 ? data.approvals[data.approvals.length - 1].status : 'pending') as any}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ marginTop: 4, mx: 'auto' }}>
        <Grid container spacing={4}>
          {/* Left Column - Main Information */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* General Information */}
              <InfoCard title="General Information" icon="tabler:info-circle" color="info">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Document Number" value={data.noDokumen} icon="tabler:file-text" />
                    <InfoRow label="Type" value={data.type} icon="tabler:tag" />
                    <InfoRow label="Revision" value={data.noRevisi.toString()} icon="tabler:git-branch" />
                    <InfoRow label="Hospital/Lab" value={data.namaRS} icon="tabler:building-hospital" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Lab Name" value={data.namaLab} icon="tabler:microscope" />
                    <InfoRow label="Department" value={data.divisi} icon="tabler:building" />
                    <InfoRow label="PIC" value={data.pic} icon="tabler:user" />
                    <InfoRow label="Address" value={data.alamat} icon="tabler:map-pin" />
                  </Grid>
                </Grid>
              </InfoCard>

              {/* Equipment Information */}
              <InfoCard title="Equipment Details" icon="tabler:device-desktop" color="success">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Equipment" value={data.alat} icon="tabler:device-desktop" />
                    <InfoRow label="Brand" value={data.merk} icon="tabler:brand" />
                    <InfoRow label="Serial Number" value={data.serialNumber} icon="tabler:number" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Phone" value={data.noTelepon} icon="tabler:phone" />
                    <InfoRow label="Invoice Number" value={data.noInvoice} icon="tabler:receipt" />
                  </Grid>
                </Grid>
              </InfoCard>

              {/* Responsible Persons */}
              <InfoCard title="Responsible Persons" icon="tabler:users" color="warning">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Lab Head" value={data.namaKepalaLab} icon="tabler:user-star" />
                    <InfoRow label="Equipment PIC" value={data.penanggungJawabAlat} icon="tabler:user-check" />
                    <InfoRow label="Business Rep" value={data.businessRepresentivePerson} icon="tabler:user-plus" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Tech Support" value={data.technicalSupport} icon="tabler:headphones" />
                    <InfoRow label="Field Engineer" value={data.fieldServiceEngineer} icon="tabler:tool" />
                  </Grid>
                </Grid>
              </InfoCard>

              {/* Items and Accessories */}
              {(data.items.length > 0 || data.accesories.length > 0) && (
                <InfoCard title="Items & Accessories" icon="tabler:package" color="secondary">
                  {data.items.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary' }}>
                        Main Items
                      </Typography>
                      <Grid container spacing={2}>
                        {data.items.map((item, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper sx={{ 
                              p: 2, 
                              bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'success.lighter',
                              border: theme => theme.palette.mode === 'dark' ? '1px solid' : 'none',
                              borderColor: 'success.main'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ color: 'success.main', mr: 1 }}>
                                  <Icon icon="tabler:check" />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {item.quantity} {item.unit}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {data.accesories.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary' }}>
                        Accessories
                      </Typography>
                      <Grid container spacing={2}>
                        {data.accesories.map((item, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper sx={{ 
                              p: 2, 
                              bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'info.lighter',
                              border: theme => theme.palette.mode === 'dark' ? '1px solid' : 'none',
                              borderColor: 'info.main'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ color: 'info.main', mr: 1 }}>
                                  <Icon icon="tabler:check" />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {item.quantity} {item.unit}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </InfoCard>
              )}

              {/* Notes */}
              {(data.catatan || data.praInstalasi) && (
                <InfoCard title="Notes & Pre-Installation" icon="tabler:notes" color="info">
                  {data.catatan && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                        Notes
                      </Typography>
                      <Paper sx={{ 
                        p: 2, 
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                        border: theme => theme.palette.mode === 'dark' ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">{data.catatan}</Typography>
                      </Paper>
                    </Box>
                  )}
                  {data.praInstalasi && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                        Pre-Installation Requirements
                      </Typography>
                      <Paper sx={{ 
                        p: 2, 
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                        border: theme => theme.palette.mode === 'dark' ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">{data.praInstalasi}</Typography>
                      </Paper>
                    </Box>
                  )}
                </InfoCard>
              )}

              {/* Revise Button for Rejected Requests */}
              {isRejected && (
                <Card sx={{ border: '2px dashed', borderColor: 'warning.main', bgcolor: 'warning.lighter' }}>
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
                      onClick={() => router.push('/requests/edit/' + data.id)}
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
            </Stack>
          </Grid>

          {/* Right Column - Timeline & Actions */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Timeline */}
              <InfoCard title="Timeline" icon="tabler:calendar" color="primary">
                <Stack spacing={2}>
                  <InfoRow label="Submission Date" value={formatDate(data.tanggalPengajuan)} icon="tabler:calendar-plus" />
                  <InfoRow label="Installation Request" value={formatDate(data.tanggalPermintaanPemasangan)} icon="tabler:calendar-event" />
                  <InfoRow label="Installation Date" value={formatDate(data.tanggalPemasangan)} icon="tabler:calendar-check" />
                  <InfoRow label="Training Date" value={formatDate(data.tanggalTraining)} icon="tabler:graduation-cap" />
                  <InfoRow label="Created" value={formatDate(data.dtCreated)} icon="tabler:clock" />
                  <InfoRow label="Last Updated" value={formatDate(data.dtUpdated)} icon="tabler:refresh" />
                </Stack>
              </InfoCard>

              {/* Approval Timeline */}
              {data.approvals.length > 0 && (
                <InfoCard title="Approval History" icon="tabler:timeline" color="success">
                  <ApprovalTimeline approvals={data.approvals} />
                </InfoCard>
              )}

              {(data.approvals.length === 0 || !data.approvals[data.approvals.length - 1]?.isFinalStatus) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => router.push('/requests/edit/' + data.id)}
                  >
                    REJECT
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      await handleSubmit("APPROVED")
                    }}
                  >
                    APPROVE
                  </Button>
                  <Snackbar
                      open={openSnackbar}
                      autoHideDuration={6000}
                      onClose={() => setOpenSnackbar(false)}
                      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                      <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity="success"
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => router.reload()}
                          >
                            REFRESH
                          </Button>
                        }
                        sx={{ width: '100%' }}
                      >
                        Request berhasil disetujui!
                      </Alert>
                    </Snackbar>
                </Box>
              )}

              {/* Approval Actions */}
              {isApproval && (
                <Card sx={{ border: '2px dashed', borderColor: 'primary.main', bgcolor: 'primary.lighter' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                      Approval Actions
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={onApprove}
                        startIcon={<Icon icon="tabler:check" />}
                        sx={{
                          bgcolor: 'success.main',
                          '&:hover': { bgcolor: 'success.dark' },
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Approve Request
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        color="error"
                        onClick={onReject}
                        startIcon={<Icon icon="tabler:x" />}
                        sx={{
                          borderColor: 'error.main',
                          color: 'error.main',
                          '&:hover': {
                            borderColor: 'error.dark',
                            bgcolor: 'error.lighter'
                          },
                          py: 1.5,
                          fontWeight: 600
                        }}
                      >
                        Reject Request
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default RequestFormDetailView 