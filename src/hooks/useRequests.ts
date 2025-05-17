import { useState, useEffect } from 'react'
import { requestService } from 'src/services/requestService'
import { Request } from 'src/types/request'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'

export const useRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!user) {
      setError('You must be logged in to view requests')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const requestsList = await requestService.getMyRequests(user.id)
      setRequests(requestsList)
    } catch (err) {
      console.error('Error fetching requests:', err)
      let errorMessage = 'Failed to fetch requests'
      
      if (err instanceof FirebaseError && err.code === 'failed-precondition') {
        errorMessage = 'The system is being set up. Please try again in a few minutes.'
        toast.error(errorMessage, { duration: 5000 })
      } else {
        errorMessage = err instanceof Error ? err.message : 'Failed to fetch requests'
        toast.error(errorMessage)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  return { requests, loading, error, refreshRequests: fetchRequests }
} 