import React, { useState } from 'react'
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, Alert, Divider } from '@mui/material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const ApiDocs = () => {
  const [value, setValue] = useState(0)
  const [testResponse, setTestResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    singleDevice: {
      to: 'fcm_device_token_here',
      notification: {
        title: 'Hello!',
        body: 'This is a test notification'
      },
      data: {
        messageId: '123',
        type: 'chat'
      },
      priority: 'high'
    },
    multipleDevices: {
      registrationIds: ['token1', 'token2', 'token3'],
      notification: {
        title: 'Hello!',
        body: 'This is a test notification'
      }
    },
    topicNotification: {
      topic: 'news',
      notification: {
        title: 'Breaking News!',
        body: 'Important update for all subscribers'
      }
    }
  })

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const testEndpoint = async (endpoint: string, data: any) => {
    setLoading(true)
    setTestResponse(null)
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      setTestResponse({
        status: response.status,
        data: result
      })
    } catch (error) {
      setTestResponse({
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTestData = (type: keyof typeof testData, field: string, value: any) => {
    setTestData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h3" gutterBottom>
        🔥 FCM Notification API Documentation
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="API documentation tabs">
          <Tab label="Single Device" />
          <Tab label="Multiple Devices" />
          <Tab label="Topic Notification" />
          <Tab label="API Reference" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <Typography variant="h5" gutterBottom>
          Send to Single Device
        </Typography>
        <Typography variant="body1" paragraph>
          Send a notification to a single device using its FCM token.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Request Data:</Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={JSON.stringify(testData.singleDevice, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setTestData(prev => ({ ...prev, singleDevice: parsed }))
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>

        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/api/fcm/send/', testData.singleDevice)}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Single Device'}
        </Button>

        {testResponse && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Response:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Status: {testResponse.status}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(testResponse.data, null, 2)}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h5" gutterBottom>
          Send to Multiple Devices
        </Typography>
        <Typography variant="body1" paragraph>
          Send a notification to multiple devices using their FCM tokens.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Request Data:</Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={JSON.stringify(testData.multipleDevices, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setTestData(prev => ({ ...prev, multipleDevices: parsed }))
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>

        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/api/fcm/send/', testData.multipleDevices)}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Multiple Devices'}
        </Button>

        {testResponse && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Response:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Status: {testResponse.status}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(testResponse.data, null, 2)}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h5" gutterBottom>
          Send to Topic
        </Typography>
        <Typography variant="body1" paragraph>
          Send a notification to all devices subscribed to a topic.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Request Data:</Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={JSON.stringify(testData.topicNotification, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setTestData(prev => ({ ...prev, topicNotification: parsed }))
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>

        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/api/fcm/send/', testData.topicNotification)}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Topic Notification'}
        </Button>

        {testResponse && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Response:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Status: {testResponse.status}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(testResponse.data, null, 2)}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h5" gutterBottom>
          API Reference
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Endpoints:</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>POST /api/fcm/send/</strong>
            </Typography>
            <Typography variant="body2">
              Main endpoint for sending FCM notifications using environment variables.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>POST /api/fcm/send-with-json/</strong>
            </Typography>
            <Typography variant="body2">
              Alternative endpoint using service account JSON directly.
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Request Parameters:</Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" component="div">
              <ul>
                <li><strong>to</strong> (string): FCM device token for single device</li>
                <li><strong>registrationIds</strong> (array): Array of FCM device tokens</li>
                <li><strong>topic</strong> (string): Topic name for topic-based notification</li>
                <li><strong>notification</strong> (object): Notification content
                  <ul>
                    <li><strong>title</strong> (string): Notification title</li>
                    <li><strong>body</strong> (string): Notification body</li>
                    <li><strong>icon</strong> (string, optional): Icon URL</li>
                    <li><strong>clickAction</strong> (string, optional): Click action</li>
                  </ul>
                </li>
                <li><strong>data</strong> (object, optional): Additional data</li>
                <li><strong>priority</strong> (string, optional): 'normal' or 'high'</li>
                <li><strong>collapseKey</strong> (string, optional): For notification grouping</li>
                <li><strong>timeToLive</strong> (integer, optional): TTL in seconds</li>
                <li><strong>delayWhileIdle</strong> (boolean, optional): Delay until device active</li>
              </ul>
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Response Codes:</Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" component="div">
              <ul>
                <li><strong>200</strong>: Notification sent successfully</li>
                <li><strong>400</strong>: Bad request - missing required fields</li>
                <li><strong>405</strong>: Method not allowed</li>
                <li><strong>500</strong>: Internal server error</li>
              </ul>
            </Typography>
          </Paper>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Replace the example tokens with real FCM device tokens from your mobile app for actual testing.
          </Typography>
        </Alert>
      </TabPanel>
    </Box>
  )
}

export default ApiDocs 