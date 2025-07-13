import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import app from 'src/configs/firebase'
import { getMessagingInstance } from 'src/configs/firebase'

// Initialize Firebase Messaging
const messaging = getMessaging(app)

export interface FCMNotification {
  title: string
  body: string
  image?: string
  icon?: string
  clickAction?: string
  data?: Record<string, string>
}

export interface FCMDeviceToken {
  id?: string
  userId: string
  deviceToken: string
  deviceType: 'android' | 'ios' | 'web'
  deviceInfo?: {
    model?: string
    os?: string
    version?: string
  }
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface FCMMessage {
  id?: string
  title: string
  body: string
  data?: Record<string, string>
  targetType: 'all' | 'user' | 'topic' | 'device'
  targetIds: string[] // userIds, topic names, or device tokens
  sentAt?: Date
  status: 'pending' | 'sent' | 'failed'
  errorMessage?: string
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

class FCMService {
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

  /**
   * Save device token to Firestore
   */
  async saveDeviceToken(userId: string, deviceToken: string, deviceType: 'android' | 'ios' | 'web', deviceInfo?: any): Promise<string> {
    const tokenData: Omit<FCMDeviceToken, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      deviceToken,
      deviceType,
      deviceInfo,
      isActive: true
    }

    // Check if token already exists for this user
    const existingTokenQuery = await getDoc(doc(db, 'fcm_tokens', `${userId}_${deviceType}`))
    
    if (existingTokenQuery.exists()) {
      // Update existing token
      await setDoc(doc(db, 'fcm_tokens', `${userId}_${deviceType}`), {
        ...tokenData,
        updatedAt: serverTimestamp()
      }, { merge: true })
      return `${userId}_${deviceType}`
    } else {
      // Create new token
      const tokenRef = doc(db, 'fcm_tokens', `${userId}_${deviceType}`)
      await setDoc(tokenRef, {
        ...tokenData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return tokenRef.id
    }
  },

  /**
   * Get device tokens for a user
   */
  async getUserDeviceTokens(userId: string): Promise<FCMDeviceToken[]> {
    const tokensRef = collection(db, 'fcm_tokens')
    const { getDocs, query, where } = await import('firebase/firestore')
    
    const q = query(tokensRef, where('userId', '==', userId), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as FCMDeviceToken[]
  },

  /**
   * Get all active device tokens
   */
  async getAllActiveDeviceTokens(): Promise<FCMDeviceToken[]> {
    const tokensRef = collection(db, 'fcm_tokens')
    const { getDocs, query, where } = await import('firebase/firestore')
    
    const q = query(tokensRef, where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as FCMDeviceToken[]
  },

  /**
   * Deactivate device token
   */
  async deactivateDeviceToken(tokenId: string): Promise<void> {
    await setDoc(doc(db, 'fcm_tokens', tokenId), {
      isActive: false,
      updatedAt: serverTimestamp()
    }, { merge: true })
  },

  /**
   * Save message to Firestore for tracking
   */
  async saveMessage(message: Omit<FCMMessage, 'id' | 'sentAt'>): Promise<string> {
    const messageRef = await addDoc(collection(db, 'fcm_messages'), {
      ...message,
      sentAt: serverTimestamp()
    })
    return messageRef.id
  },

  /**
   * Update message status
   */
  async updateMessageStatus(messageId: string, status: 'sent' | 'failed', errorMessage?: string): Promise<void> {
    await setDoc(doc(db, 'fcm_messages', messageId), {
      status,
      errorMessage,
      updatedAt: serverTimestamp()
    }, { merge: true })
  },

  /**
   * Get message history
   */
  async getMessageHistory(limit: number = 50): Promise<FCMMessage[]> {
    const messagesRef = collection(db, 'fcm_messages')
    const { getDocs, query, orderBy, limit: limitQuery } = await import('firebase/firestore')
    
    const q = query(messagesRef, orderBy('sentAt', 'desc'), limitQuery(limit))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      sentAt: doc.data().sentAt?.toDate()
    })) as FCMMessage[]
  }
}

export const fcmService = new FCMService()
export default fcmService 