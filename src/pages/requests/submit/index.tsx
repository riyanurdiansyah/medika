// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestForm from 'src/components/requests/RequestForm'
import { RequestType } from 'src/types/request'

const SubmitRequestPage = () => {
  const router = useRouter()

  const handleSubmit = (data: {
    title: string
    description: string
    type: RequestType
    estimatedCost?: number
  }) => {
    // Implement submit logic
    console.log('Submit request:', data)
    
    // Navigate back to list after submit
    router.push('/requests/list')
  }

  const handleCancel = () => {
    router.push('/requests/list')
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Submit New Request</h5>}
        subtitle={<>Create a new request for goods, training, or other needs</>}
      />
      <Grid item xs={12}>
        <RequestForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Grid>
    </Grid>
  )
}

export default SubmitRequestPage 