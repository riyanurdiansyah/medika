import { getMessagingInstance } from 'src/configs/firebase'
import { getToken, onMessage } from 'firebase/messaging'

export interface FCMNotification {
  title: string
  body: string
  icon?: string
  clickAction?: string
  data?: Record<string, string>
}

export interface FCMRequest {
  to?: string
  registrationIds?: string[]
  topic?: string
  notification: FCMNotification
  data?: Record<string, string>
  priority?: 'normal' | 'high'
  collapseKey?: string
  timeToLive?: number
  delayWhileIdle?: boolean
}

class FCMNotificationService {
  private messaging: any = null
  private vapidKey: string = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

  async initialize() {
    try {
      this.messaging = await getMessagingInstance()
      if (!this.messaging) {
        console.warn('FCM is not supported in this environment')
        return false
      }
      return true
    } catch (error) {
      console.error('Failed to initialize FCM:', error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.messaging) {
      console.warn('FCM not initialized')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      console.warn('FCM not initialized')
      return null
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      })
      return token
    } catch (error) {
      console.error('Failed to get FCM token:', error)
      return null
    }
  }

  async sendNotification(request: FCMRequest): Promise<boolean> {
    try {
      const response = await fetch('/api/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    try {
      const response = await fetch('/api/fcm/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, topic }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to subscribe to topic:', error)
      return false
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    try {
      const response = await fetch('/api/fcm/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, topic }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error)
      return false
    }
  }

  onMessageReceived(callback: (payload: any) => void) {
    if (!this.messaging) {
      console.warn('FCM not initialized')
      return () => {}
    }

    return onMessage(this.messaging, callback)
  }
}

export const fcmNotificationService = new FCMNotificationService()
export default fcmNotificationService 