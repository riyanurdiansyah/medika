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
  Paper
} from '@mui/material'
import { format } from 'date-fns'
import { Request, RequestStatus } from 'src/types/request'
import { requestService } from 'src/services/requestService'
import { userService } from 'src/services/userService'
import PageHeader from 'src/@core/components/page-header'
import { UserData } from 'src/types/user'
import Icon from 'src/@core/components/icon'

const RequestView = () => {
  const router = useRouter()
  const { id } = router.query
  const [request, setRequest] = useState<Request | null>(null)
  const [nextApprover, setNextApprover] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequestAndApprover = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const data = await requestService.getRequestById(id as string)
        if (!data) {
          setError('Request not found')
          return
        }
        setRequest(data)

        // Only fetch next approver if request is not completed or rejected
        if (data.status !== 'completed' && data.status !== 'rejected') {
          try {
            const requesterData = await userService.getUserById(data.requesterId)
            if (requesterData?.directSuperior) {
              const superiorData = await userService.getUserById(requesterData.directSuperior)
              setNextApprover(superiorData)
            }
          } catch (err) {
            console.error('Error fetching next approver:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching request:', err)
        setError('Failed to fetch request details')
      } finally {
        setLoading(false)
      }
    }

    fetchRequestAndApprover()
  }, [id])

  const getStatusColor = (status: RequestStatus): 'warning' | 'info' | 'error' | 'success' => {
    const statusColors = {
      pending: 'warning',
      approved_supervisor: 'info',
      approved_manager: 'info',
      approved_deputy: 'info',
      rejected: 'error',
      completed: 'success'
    } as const
    return statusColors[status]
  }

  const getStatusLabel = (status: RequestStatus) => {
    const statusLabels = {
      pending: 'Pending',
      approved_supervisor: 'Approved by Supervisor',
      approved_manager: 'Approved by Manager',
      approved_deputy: 'Approved by Deputy',
      rejected: 'Rejected',
      completed: 'Completed'
    }
    return statusLabels[status]
  }

  const getNextApprovalLevel = (level: number): string => {
    const levels = {
      1: 'Supervisor',
      2: 'Manager',
      3: 'Deputy Manager'
    }
    return levels[level as keyof typeof levels] || 'Unknown'
  }

  const getApprovalPath = () => {
    const totalLevels = 3 // Supervisor -> Manager -> Deputy Manager
    const currentLevel = request?.currentApprovalLevel || 1
    const status = request?.status || 'pending'

    const isCompleted = status === 'completed'
    const isRejected = status === 'rejected'

    return Array.from({ length: totalLevels }, (_, index) => {
      const level = index + 1
      const approvalEntry = request?.approvalHistory.find(entry => entry.level === level)
      
      return {
        level,
        role: getNextApprovalLevel(level),
        status: approvalEntry?.status || 
                (isRejected ? 'cancelled' :
                 isCompleted ? 'approved' :
                 level < currentLevel ? 'approved' :
                 level === currentLevel ? 'pending' : 'waiting')
      }
    })
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

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<Typography variant="h5">Request Details</Typography>}
        subtitle={<Typography variant="body2">View request information and approval history</Typography>}
      />
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={5}>
              {/* Title and Status Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 6,
                    pb: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main'
                      }}
                    >
                      <Icon icon="tabler:file-description" fontSize={24} />
                    </Box>
                    <Box>
                      <Typography variant="h6">{request.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Request #{request.id?.slice(0, 8)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={getStatusLabel(request.status)}
                    color={getStatusColor(request.status)}
                    sx={{ 
                      height: 32,
                      px: 2,
                      '& .MuiChip-label': { 
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Approval Path Section - Keep existing code */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'primary.lighter',
                    borderRadius: 1,
                    mb: 4
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Icon icon="tabler:git-branch" />
                    <Typography variant="subtitle1">Approval Path</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {getApprovalPath().map((step, index) => (
                      <Box
                        key={step.level}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          '&:last-of-type': {
                            flex: 0
                          }
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 2
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: step.status === 'approved' ? 'success.main' :
                                      step.status === 'pending' ? 'warning.main' :
                                      step.status === 'rejected' ? 'error.main' :
                                      step.status === 'cancelled' ? 'text.disabled' : 'grey.300',
                              color: 'white',
                              mb: 1
                            }}
                          >
                            {step.status === 'approved' && <Icon icon="tabler:check" />}
                            {step.status === 'pending' && <Icon icon="tabler:clock" />}
                            {step.status === 'rejected' && <Icon icon="tabler:x" />}
                            {step.status === 'waiting' && <Icon icon="tabler:dots" />}
                            {step.status === 'cancelled' && <Icon icon="tabler:minus" />}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {step.role}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                            {step.status}
                          </Typography>
                        </Box>
                        
                        {index < getApprovalPath().length - 1 && (
                          <Box
                            sx={{
                              flex: 1,
                              height: 2,
                              bgcolor: 'grey.200',
                              position: 'relative',
                              top: -20
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>

                  {/* Show next approver info if request is pending */}
                  {request.status !== 'completed' && request.status !== 'rejected' && nextApprover && (
                    <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>Next Approver Information</Typography>
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            Name & Role
                          </Typography>
                          <Typography>
                            {nextApprover.fullname} ({nextApprover.role})
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            Email
                          </Typography>
                          <Typography>{nextApprover.email}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Request Information and Description */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: theme => theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Icon icon="tabler:info-circle" />
                    <Typography variant="subtitle1">Request Information</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.lighter',
                          color: 'primary.main'
                        }}
                      >
                        <Icon icon="tabler:tag" />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Type</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{request.type}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'success.lighter',
                          color: 'success.main'
                        }}
                      >
                        <Icon icon="tabler:user" />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Requester</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{request.requesterName}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'warning.lighter',
                          color: 'warning.main'
                        }}
                      >
                        <Icon icon="tabler:calendar" />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Created At</Typography>
                        <Typography sx={{ fontWeight: 600 }}>
                          {format(request.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                    {request.estimatedCost && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'info.lighter',
                            color: 'info.main'
                          }}
                        >
                          <Icon icon="tabler:currency-dollar" />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>Estimated Cost</Typography>
                          <Typography sx={{ fontWeight: 600 }}>${request.estimatedCost.toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: theme => theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Icon icon="tabler:align-left" />
                    <Typography variant="subtitle1">Description</Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      color: 'text.secondary',
                      lineHeight: 1.8
                    }}
                  >
                    {request.description}
                  </Typography>
                </Paper>
              </Grid>

              {/* Attachments Section */}
              {request.attachments && request.attachments.length > 0 && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      bgcolor: theme => theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Icon icon="tabler:paperclip" />
                      <Typography variant="subtitle1">Attachments</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {request.attachments.map((url, index) => (
                        <Box
                          key={index}
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            textDecoration: 'none',
                            color: 'primary.main',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'primary.lighter',
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Icon icon="tabler:file" />
                          <Typography>Attachment {index + 1}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Approval History Section */}
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    bgcolor: theme => theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Icon icon="tabler:history" />
                    <Typography variant="subtitle1">Approval History</Typography>
                  </Box>
                  {request.approvalHistory.length > 0 ? (
                    <Box sx={{ display: 'grid', gap: 3 }}>
                      {request.approvalHistory.map((entry, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 3,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              borderRadius: '4px 0 0 4px',
                              bgcolor: entry.status === 'approved' ? 'success.main' : 'error.main'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: entry.status === 'approved' ? 'success.lighter' : 'error.lighter',
                                  color: entry.status === 'approved' ? 'success.main' : 'error.main'
                                }}
                              >
                                <Icon 
                                  icon={entry.status === 'approved' ? 'tabler:check' : 'tabler:x'} 
                                  fontSize={20}
                                />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2">
                                  Level {entry.level} - {entry.approverRole}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                  By: {entry.approverName}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              size="small"
                              label={entry.status}
                              color={entry.status === 'approved' ? 'success' : 'error'}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                          {entry.comment && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                bgcolor: theme => theme.palette.mode === 'light' ? 'grey.50' : 'background.default',
                                p: 2,
                                borderRadius: 1
                              }}
                            >
                              {entry.comment}
                            </Typography>
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.disabled', 
                              display: 'block', 
                              mt: entry.comment ? 2 : 0
                            }}
                          >
                            {format(entry.timestamp.toDate(), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        textAlign: 'center',
                        py: 4
                      }}
                    >
                      No approval history yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default RequestView 