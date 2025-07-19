import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Autocomplete,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import { Icon } from '@iconify/react'
import fcmNotificationService, { FCMRequest, FCMNotification } from 'src/services/fcmNotificationService'
import { useUsers } from 'src/hooks/useUsers'
import { UserData } from 'src/types/user'

interface FCMRequestFormProps {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

const FCMRequestForm: React.FC<FCMRequestFormProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentToken, setCurrentToken] = useState<string>('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // Form state
  const [targetType, setTargetType] = useState<'token' | 'topic' | 'multiple'>('token')
  const [targetTopic, setTargetTopic] = useState('')
  
  // User selection state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([])
  
  // Get users with FCM tokens
  const { usersWithFCMTokens, loading: usersLoading } = useUsers()
  
  const [notification, setNotification] = useState<FCMNotification>({
    title: '',
    body: '',
    icon: '',
    clickAction: ''
  })
  
  const [data, setData] = useState<Record<string, string>>({})
  const [newDataKey, setNewDataKey] = useState('')
  const [newDataValue, setNewDataValue] = useState('')
  
  const [priority, setPriority] = useState<'normal' | 'high'>('high')
  const [collapseKey, setCollapseKey] = useState('')
  const [timeToLive, setTimeToLive] = useState(2419200) // 28 days in seconds
  const [delayWhileIdle, setDelayWhileIdle] = useState(false)

  // Topic management
  const [topicToSubscribe, setTopicToSubscribe] = useState('')
  const [topicToUnsubscribe, setTopicToUnsubscribe] = useState('')

  useEffect(() => {
    initializeFCM()
  }, [])

  const initializeFCM = async () => {
    try {
      const initialized = await fcmNotificationService.initialize()
      if (initialized) {
        const hasPermission = await fcmNotificationService.requestPermission()
        setPermissionGranted(hasPermission)
        
        if (hasPermission) {
          const token = await fcmNotificationService.getToken()
          if (token) {
            setCurrentToken(token)
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize FCM:', error)
      setMessage({ type: 'error', text: 'Failed to initialize FCM' })
    }
  }

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) {
      setMessage({ type: 'error', text: 'Title and body are required' })
      return
    }

    if (targetType === 'token' && !selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' })
      return
    }

    if (targetType === 'multiple' && selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one user' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const request: FCMRequest = {
        notification,
        data: Object.keys(data).length > 0 ? data : undefined,
        priority,
        ...(collapseKey && { collapseKey }),
        ...(timeToLive && { timeToLive }),
        ...(delayWhileIdle && { delayWhileIdle })
      }

      // Set target based on type
      if (targetType === 'token' && selectedUser?.fcmToken) {
        request.to = selectedUser.fcmToken
      } else if (targetType === 'topic' && targetTopic) {
        request.topic = targetTopic
      } else if (targetType === 'multiple' && selectedUsers.length > 0) {
        const tokens = selectedUsers.map(user => user.fcmToken).filter(Boolean) as string[]
        if (tokens.length > 0) {
          request.registrationIds = tokens
        } else {
          throw new Error('No valid FCM tokens found for selected users')
        }
      } else {
        throw new Error('Invalid target configuration')
      }

      const success = await fcmNotificationService.sendNotification(request)
      
      if (success) {
        setMessage({ type: 'success', text: 'Notification sent successfully!' })
        onSuccess?.({ success: true })
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notification'
      setMessage({ type: 'error', text: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribeToTopic = async () => {
    if (!topicToSubscribe || !currentToken) {
      setMessage({ type: 'error', text: 'Topic name and device token are required' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const success = await fcmNotificationService.subscribeToTopic(currentToken, topicToSubscribe)
      
      if (success) {
        setMessage({ type: 'success', text: `Successfully subscribed to topic: ${topicToSubscribe}` })
        setTopicToSubscribe('')
      } else {
        throw new Error('Failed to subscribe to topic')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe to topic'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribeFromTopic = async () => {
    if (!topicToUnsubscribe || !currentToken) {
      setMessage({ type: 'error', text: 'Topic name and device token are required' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const success = await fcmNotificationService.unsubscribeFromTopic(currentToken, topicToUnsubscribe)
      
      if (success) {
        setMessage({ type: 'success', text: `Successfully unsubscribed from topic: ${topicToUnsubscribe}` })
        setTopicToUnsubscribe('')
      } else {
        throw new Error('Failed to unsubscribe from topic')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe from topic'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const addDataField = () => {
    if (newDataKey && newDataValue) {
      setData(prev => ({ ...prev, [newDataKey]: newDataValue }))
      setNewDataKey('')
      setNewDataValue('')
    }
  }

  const removeDataField = (key: string) => {
    setData(prev => {
      const newData = { ...prev }
      delete newData[key]
      return newData
    })
  }

  const addUserToMultiple = (user: UserData) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user])
    }
  }

  const removeUserFromMultiple = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const copyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken)
      setMessage({ type: 'success', text: 'Token copied to clipboard!' })
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            FCM Notification Request Form
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {/* FCM Status */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              FCM Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Permission: {permissionGranted ? 'Granted' : 'Not Granted'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Token: {currentToken ? 'Available' : 'Not Available'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={copyToken}
                  disabled={!currentToken}
                  startIcon={<Icon icon="mdi:content-copy" />}
                >
                  Copy Token
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Notification Content */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Content
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Body"
                  value={notification.body}
                  onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Icon URL (optional)"
                  value={notification.icon}
                  onChange={(e) => setNotification(prev => ({ ...prev, icon: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Click Action (optional)"
                  value={notification.clickAction}
                  onChange={(e) => setNotification(prev => ({ ...prev, clickAction: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Target Configuration */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Target Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Type</InputLabel>
              <Select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                label="Target Type"
              >
                <MenuItem value="token">Single Token</MenuItem>
                <MenuItem value="topic">Topic</MenuItem>
                <MenuItem value="multiple">Multiple Tokens</MenuItem>
              </Select>
            </FormControl>

            {targetType === 'token' && (
              <>
                {usersWithFCMTokens.length === 0 && !usersLoading && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No users with FCM tokens found. Users need to have FCM tokens to receive notifications.
                  </Alert>
                )}
                <Autocomplete
                  fullWidth
                  options={usersWithFCMTokens}
                  getOptionLabel={(option) => `${option.fullname} (${option.email})`}
                  value={selectedUser}
                  onChange={(_, newValue) => setSelectedUser(newValue)}
                  loading={usersLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      placeholder="Choose a user to send notification to"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{option.fullname}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </>
            )}

            {targetType === 'topic' && (
              <TextField
                fullWidth
                label="Topic Name"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                placeholder="Enter topic name"
              />
            )}

            {targetType === 'multiple' && (
              <Box>
                {usersWithFCMTokens.length === 0 && !usersLoading && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No users with FCM tokens found. Users need to have FCM tokens to receive notifications.
                  </Alert>
                )}
                <Autocomplete
                  fullWidth
                  multiple
                  options={usersWithFCMTokens}
                  getOptionLabel={(option) => `${option.fullname} (${option.email})`}
                  value={selectedUsers}
                  onChange={(_, newValue) => setSelectedUsers(newValue)}
                  loading={usersLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Users"
                      placeholder="Choose users to send notification to"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{option.fullname}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.fullname}
                        size="small"
                      />
                    ))
                  }
                />
              </Box>
            )}
          </Box>

          {/* Additional Data */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Additional Data (Optional)
            </Typography>
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Key"
                  value={newDataKey}
                  onChange={(e) => setNewDataKey(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Value"
                  value={newDataValue}
                  onChange={(e) => setNewDataValue(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={addDataField}
                  disabled={!newDataKey || !newDataValue}
                  size="small"
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(data).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => removeDataField(key)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Advanced Options */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    label="Priority"
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Collapse Key"
                  value={collapseKey}
                  onChange={(e) => setCollapseKey(e.target.value)}
                  placeholder="Optional collapse key"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Time to Live (seconds)"
                  type="number"
                  value={timeToLive}
                  onChange={(e) => setTimeToLive(Number(e.target.value))}
                  inputProps={{ min: 0, max: 2419200 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={delayWhileIdle}
                      onChange={(e) => setDelayWhileIdle(e.target.checked)}
                    />
                  }
                  label="Delay While Idle"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Send Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendNotification}
            disabled={
              isLoading || 
              !notification.title || 
              !notification.body ||
              (targetType === 'token' && !selectedUser) ||
              (targetType === 'multiple' && selectedUsers.length === 0)
            }
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* Topic Management */}
          <Typography variant="h6" gutterBottom>
            Topic Management
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Subscribe to Topic
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Topic Name"
                      value={topicToSubscribe}
                      onChange={(e) => setTopicToSubscribe(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleSubscribeToTopic}
                      disabled={!topicToSubscribe || isLoading}
                      size="small"
                    >
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Unsubscribe from Topic
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Topic Name"
                      value={topicToUnsubscribe}
                      onChange={(e) => setTopicToUnsubscribe(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleUnsubscribeFromTopic}
                      disabled={!topicToUnsubscribe || isLoading}
                      size="small"
                    >
                      Unsubscribe
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default FCMRequestForm 