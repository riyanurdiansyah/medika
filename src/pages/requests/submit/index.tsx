import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid'
import toast from 'react-hot-toast'

// Custom Components
import PageHeader from 'src/@core/components/page-header'
import RequestForm, { FormState } from 'src/components/requests/RequestForm'
import { requestService } from 'src/services/requestService'
import { useAuth } from 'src/hooks/useAuth'
import { Timestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

const SubmitRequestPage = () => {
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (data: FormState) => {
    try {
      if (!user) {
        toast.error('You must be logged in to submit a request')
        return
      }

      const id = uuidv4()

      const firebaseData = {
        ...data,
        id,
        createdBy: user.username || user.fullname,
        dtCreated: Timestamp.now(),
        dtUpdated: Timestamp.now(),
        approvals: data.approvals || [],
        tanggalPresentasi: data.tanggalPresentasi ? Timestamp.fromDate(data.tanggalPresentasi.toDate()) : null,
        tanggal: data.tanggal ? Timestamp.fromDate(data.tanggal.toDate()) : null,
        tanggalPengajuan: data.tanggalPengajuan ? Timestamp.fromDate(data.tanggalPengajuan.toDate()) : null,
        tanggalPermintaanPemasangan: data.tanggalPermintaanPemasangan ? Timestamp.fromDate(data.tanggalPermintaanPemasangan.toDate()) : null,
        tanggalPemasangan: data.tanggalPemasangan ? Timestamp.fromDate(data.tanggalPemasangan.toDate()) : null,
        tanggalTraining: data.tanggalTraining ? Timestamp.fromDate(data.tanggalTraining.toDate()) : null,
      }

      await requestService.createRequest(firebaseData)

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
        subtitle="Create a new request for installation, training, or accessories"
      />
      <Grid item xs={12}>
        <RequestForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </Grid>
    </Grid>
  )
}

export default SubmitRequestPage
