import { useState, useEffect } from 'react'
import { userService } from 'src/services/userService'
import { UserData } from 'src/types/user'

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const getUsersWithFCMTokens = () => {
    return users.filter(user => user.fcmToken && user.status === 'active')
  }

  useEffect(() => {
    refreshUsers()
  }, [])

  return {
    users,
    usersWithFCMTokens: getUsersWithFCMTokens(),
    loading,
    error,
    refreshUsers
  }
} 