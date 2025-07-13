import React from 'react'
import { Grid, Typography } from '@mui/material'
import FCMRequestForm from 'src/components/fcm/FCMRequestForm'
import PageHeader from 'src/@core/components/page-header'

const FCMPage = () => {
  const handleSuccess = (result: any) => {
    console.log('FCM notification sent successfully:', result)
  }

  const handleError = (error: string) => {
    console.error('FCM notification failed:', error)
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Firebase Cloud Messaging (FCM)</h5>}
        subtitle={<>Send push notifications to devices using Firebase Cloud Messaging. You can send to individual devices, topics, or multiple devices at once.</>}
      />
      <Grid item xs={12}>
        <FCMRequestForm 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Grid>
    </Grid>
  )
}

export default FCMPage 