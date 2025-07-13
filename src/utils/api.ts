import { UserData } from 'src/types/user'
import { FCMDeviceToken, FCMMessage } from 'src/services/fcmService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

interface ApiResponse<T> {
  success: boolean
  data?: T
  count?: number
  error?: string
  message?: string
}

export const userApi = {
  /**
   * Get all users from Firebase
   */
  async getAllUsers(): Promise<UserData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<UserData[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users')
      }

      return result.data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  /**
   * Get a single user by ID
   */
  async getUserById(id: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<UserData> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user')
      }

      return result.data || null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  /**
   * Update a user
   */
  async updateUser(id: string, data: Partial<UserData>): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<void> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<void> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}

export const fcmApi = {
  /**
   * Send FCM notification
   */
  async sendNotification(data: {
    title: string
    body: string
    data?: Record<string, string>
    targetType: 'all' | 'user' | 'topic' | 'device'
    targetIds: string[]
    image?: string
    icon?: string
    clickAction?: string
  }): Promise<{ messageId: string; sentTo: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fcm/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<{ messageId: string; sentTo: number }> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send notification')
      }

      return result.data!
    } catch (error) {
      console.error('Error sending FCM notification:', error)
      throw error
    }
  },

  /**
   * Save device token
   */
  async saveDeviceToken(data: {
    userId: string
    deviceToken: string
    deviceType: 'android' | 'ios' | 'web'
    deviceInfo?: any
  }): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fcm/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<{ tokenId: string }> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save device token')
      }

      return result.data!.tokenId
    } catch (error) {
      console.error('Error saving device token:', error)
      throw error
    }
  },

  /**
   * Get device tokens
   */
  async getDeviceTokens(userId?: string): Promise<FCMDeviceToken[]> {
    try {
      const url = userId 
        ? `${API_BASE_URL}/api/fcm/tokens?userId=${userId}`
        : `${API_BASE_URL}/api/fcm/tokens`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<FCMDeviceToken[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get device tokens')
      }

      return result.data || []
    } catch (error) {
      console.error('Error getting device tokens:', error)
      throw error
    }
  },

  /**
   * Get message history
   */
  async getMessageHistory(limit: number = 50): Promise<FCMMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fcm/messages?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<FCMMessage[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get message history')
      }

      return result.data || []
    } catch (error) {
      console.error('Error getting message history:', error)
      throw error
    }
  }
} 