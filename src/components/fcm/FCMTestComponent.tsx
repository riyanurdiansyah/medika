import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material'
import { fcmApi } from 'src/utils/api'
import { FCMDeviceToken, FCMMessage } from 'src/services/fcmService'

const FCMTestComponent: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'user' | 'topic' | 'device'>('all')
  const [targetIds, setTargetIds] = useState('')
  const [image, setImage] = useState('')
  const [clickAction, setClickAction] = useState('')
  
  // Data state
  const [deviceTokens, setDeviceTokens] = useState<FCMDeviceToken[]>([])
  const [messages, setMessages] = useState<FCMMessage[]>([])

  // Load initial data
  useEffect(() => {
    loadDeviceTokens()
    loadMessageHistory()
  }, [])

  const loadDeviceTokens = async () => {
    try {
      const tokens = await fcmApi.getDeviceTokens()
      setDeviceTokens(tokens)
    } catch (err) {
      console.error('Error loading device tokens:', err)
    }
  }

  const loadMessageHistory = async () => {
    try {
      const history = await fcmApi.getMessageHistory(10)
      setMessages(history)
    } catch (err) {
      console.error('Error loading message history:', err)
    }
  }

  const handleSendNotification = async () => {
    if (!title || !body) {
      setError('Title and body are required')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const targetIdsArray = targetIds ? targetIds.split(',').map(id => id.trim()) : []
      
      const result = await fcmApi.sendNotification({
        title,
        body,
        targetType,
        targetIds: targetIdsArray,
        image: image || undefined,
        clickAction: clickAction || undefined
      })

      setSuccess(`Notification sent successfully! Message ID: ${result.messageId}, Sent to: ${result.sentTo} devices`)
      
      // Clear form
      setTitle('')
      setBody('')
      setTargetIds('')
      setImage('')
      setClickAction('')
      
      // Reload data
      loadMessageHistory()
      loadDeviceTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTestToken = async () => {
    setLoading(true)
    setError(null)

    try {
      const testToken = 'test-device-token-' + Date.now()
      await fcmApi.saveDeviceToken({
        userId: 'test-user-123',
        deviceToken: testToken,
        deviceType: 'android',
        deviceInfo: {
          model: 'Test Device',
          os: 'Android',
          version: '11.0'
        }
      })

      setSuccess('Test device token saved successfully!')
      loadDeviceTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        FCM Notification Testing
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Send Notification Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Send Notification
              </Typography>

              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Target Type</InputLabel>
                <Select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  label="Target Type"
                >
                  <MenuItem value="all">All Devices</MenuItem>
                  <MenuItem value="user">Specific Users</MenuItem>
                  <MenuItem value="device">Specific Devices</MenuItem>
                  <MenuItem value="topic">Topic</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Target IDs (comma-separated)"
                value={targetIds}
                onChange={(e) => setTargetIds(e.target.value)}
                margin="normal"
                helperText={
                  targetType === 'user' ? 'User IDs (e.g., user1, user2)' :
                  targetType === 'device' ? 'Device tokens' :
                  targetType === 'topic' ? 'Topic names' :
                  'Leave empty for all devices'
                }
              />

              <TextField
                fullWidth
                label="Image URL (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Click Action (optional)"
                value={clickAction}
                onChange={(e) => setClickAction(e.target.value)}
                margin="normal"
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSendNotification}
                  disabled={loading || !title || !body}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} /> : 'Send Notification'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Tokens */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Device Tokens ({deviceTokens.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSaveTestToken}
                  disabled={loading}
                >
                  Add Test Token
                </Button>
              </Box>

              {deviceTokens.length === 0 ? (
                <Typography color="text.secondary">
                  No device tokens found
                </Typography>
              ) : (
                <Box>
                  {deviceTokens.map((token) => (
                    <Box key={token.id} sx={{ mb: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {token.userId} ({token.deviceType})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {token.deviceToken}
                      </Typography>
                      <Chip 
                        label={token.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={token.isActive ? 'success' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Message History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Messages ({messages.length})
              </Typography>

              {messages.length === 0 ? (
                <Typography color="text.secondary">
                  No messages found
                </Typography>
              ) : (
                <Box>
                  {messages.map((message) => (
                    <Box key={message.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {message.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {message.body}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={message.targetType} 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={message.status} 
                              size="small" 
                              color={message.status === 'sent' ? 'success' : message.status === 'failed' ? 'error' : 'warning'}
                            />
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {message.sentAt?.toLocaleString()}
                        </Typography>
                      </Box>
                      {message.errorMessage && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {message.errorMessage}
                        </Alert>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FCMTestComponent 