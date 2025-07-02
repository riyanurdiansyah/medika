import { useState, useEffect } from 'react'
import { requestService } from 'src/services/requestService'
import { userService } from 'src/services/userService'
import { RequestFormM } from 'src/types/requestForm'
import { UserData } from 'src/types/user'
import { useAuth } from './useAuth'

export const useRequestsForApprovals = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestFormM[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!user) {
      setRequests([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, get all users (equivalent to _dC.users in Flutter)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)

      // Then get requests for approvals using the Flutter-style function
      const requestsData = await requestService.getRequestsForApprovals(user.id, allUsers)
      setRequests(requestsData)
    } catch (err) {
      console.error('Error fetching requests for approvals:', err)
      setError('Failed to fetch requests for approvals')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  const refreshRequests = () => {
    fetchRequests()
  }

  return {
    requests,
    users,
    loading,
    error,
    refreshRequests
  }
} 