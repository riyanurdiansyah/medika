import { useState, useEffect, useCallback } from 'react'
import { requestService } from 'src/services/requestService'
import { Request } from 'src/types/request'
import { RequestFormM } from 'src/types/requestForm'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'

export const useRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to view requests')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Clear existing requests (similar to Flutter's requests.clear())
      setRequests([])
      
      // Fetch requests (similar to Flutter's getRequests())
      const requestsList = await requestService.getMyRequests(user.id)
      
      // Set requests (similar to Flutter's requests.value = ...)
      setRequests(requestsList)
    } catch (err) {
      console.error('Error fetching requests:', err)
      let errorMessage = 'Failed to get documents'
      
      if (err instanceof FirebaseError && err.code === 'failed-precondition') {
        errorMessage = 'The system is being set up. Please try again in a few minutes.'
        toast.error(errorMessage, { duration: 5000 })
      } else {
        errorMessage = err instanceof Error ? err.message : 'Failed to get documents'
        toast.error(errorMessage)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return { requests, loading, error, refreshRequests: fetchRequests }
}

// Direct conversion of Flutter getRequests() function
// Flutter: Future getRequests() async { ... }
export const useRequestsByCreatedBy = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestFormM[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getRequests = useCallback(async () => {
    if (!user?.username) {
      setError('Username not found')
      setLoading(false)
      return
    }

    try {
      // Clear existing requests (Flutter: requests.clear())
      setRequests([])
      
      // Fetch requests using createdBy field (Flutter: where("createdBy", isEqualTo: dC.profile.value?.username))
      const response = await requestService.getRequestsByCreatedBy(user.username)
      
      // Set requests (Flutter: requests.value = response.docs.map((e) => RequestFormM.fromJson(e.data())).toList())
      setRequests(response)
    } catch (err) {
      console.error('Error in getRequests:', err)
      // Flutter: AppDialog.showErrorMessage("Failed get dokumen $e")
      const errorMessage = `Failed get dokumen ${err}`
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    getRequests()
  }, [getRequests])

  return { requests, loading, error, refreshRequests: getRequests }
} 