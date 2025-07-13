import React from 'react'
import { Grid, Card, CardContent, Alert, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'

const NotificationHistoryPage = () => {
  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Notification History</h5>}
        subtitle={<>View the history of sent notifications and their delivery status.</>}
      />
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This feature is coming soon. You'll be able to view notification history, delivery status, and analytics here.
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No notifications sent yet. Start by sending your first notification from the FCM page.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default NotificationHistoryPage 