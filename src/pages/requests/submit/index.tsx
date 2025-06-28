// ** React Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import RequestForm from 'src/components/requests/RequestForm'
import { RequestType } from 'src/types/request'
import { requestService } from 'src/services/requestService'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'

const SubmitRequestPage = () => {
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (data: {
    title: string
    description: string
    type: RequestType
    estimatedCost?: number
  }) => {
    try {
      if (!user) {
        toast.error('You must be logged in to submit a request')
        return
      }

      await requestService.createRequest({
        ...data,
        requesterId: user.id,
        requesterName: user.fullname,
        createdBy: user.username || user.fullname
      })

      toast.success('Request submitted successfully')
      router.push('/requests/list')
    } catch (err) {
      console.error('Error submitting request:', err)
      toast.error('Failed to submit request')
    }
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