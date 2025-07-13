import React from 'react'
import { Grid, Card, CardContent, Alert, Typography } from '@mui/material'
import PageHeader from 'src/@core/components/page-header'

const TopicManagementPage = () => {
  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Topic Management</h5>}
        subtitle={<>Manage FCM topics and view subscription statistics.</>}
      />
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This feature is coming soon. You'll be able to create, manage, and monitor FCM topics here.
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Topics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No topics created yet. Topics can be created and managed here for targeted notifications.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TopicManagementPage 