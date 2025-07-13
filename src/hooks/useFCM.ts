import { useState, useEffect, useCallback } from 'react'
import fcmNotificationService, { FCMRequest } from 'src/services/fcmNotificationService'

interface FCMState {
  isInitialized: boolean
  hasPermission: boolean
  currentToken: string | null
  isSupported: boolean
}

interface FCMHookReturn extends FCMState {
  initialize: () => Promise<boolean>
  requestPermission: () => Promise<boolean>
  getToken: () => Promise<string | null>
  sendNotification: (request: FCMRequest) => Promise<boolean>
  subscribeToTopic: (topic: string) => Promise<boolean>
  unsubscribeFromTopic: (topic: string) => Promise<boolean>
  onMessageReceived: (callback: (payload: any) => void) => () => void
}

export const useFCM = (): FCMHookReturn => {
  const [state, setState] = useState<FCMState>({
    isInitialized: false,
    hasPermission: false,
    currentToken: null,
    isSupported: true
  })

  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      const isSupported = await fcmNotificationService.initialize()
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false }))
        return false
      }

      setState(prev => ({ ...prev, isInitialized: true }))
      return true
    } catch (error) {
      console.error('Failed to initialize FCM:', error)
      setState(prev => ({ ...prev, isSupported: false }))
      return false
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await fcmNotificationService.requestPermission()
      setState(prev => ({ ...prev, hasPermission }))
      
      if (hasPermission) {
        const token = await fcmNotificationService.getToken()
        setState(prev => ({ ...prev, currentToken: token }))
      }
      
      return hasPermission
    } catch (error) {
      console.error('Failed to request FCM permission:', error)
      return false
    }
  }, [])

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await fcmNotificationService.getToken()
      setState(prev => ({ ...prev, currentToken: token }))
      return token
    } catch (error) {
      console.error('Failed to get FCM token:', error)
      return null
    }
  }, [])

  const sendNotification = useCallback(async (request: FCMRequest): Promise<boolean> => {
    try {
      return await fcmNotificationService.sendNotification(request)
    } catch (error) {
      console.error('Failed to send FCM notification:', error)
      return false
    }
  }, [])

  const subscribeToTopic = useCallback(async (topic: string): Promise<boolean> => {
    try {
      if (!state.currentToken) {
        console.error('No FCM token available')
        return false
      }
      return await fcmNotificationService.subscribeToTopic(state.currentToken, topic)
    } catch (error) {
      console.error('Failed to subscribe to FCM topic:', error)
      return false
    }
  }, [state.currentToken])

  const unsubscribeFromTopic = useCallback(async (topic: string): Promise<boolean> => {
    try {
      if (!state.currentToken) {
        console.error('No FCM token available')
        return false
      }
      return await fcmNotificationService.unsubscribeFromTopic(state.currentToken, topic)
    } catch (error) {
      console.error('Failed to unsubscribe from FCM topic:', error)
      return false
    }
  }, [state.currentToken])

  const onMessageReceived = useCallback((callback: (payload: any) => void) => {
    return fcmNotificationService.onMessageReceived(callback)
  }, [])

  // Auto-initialize on mount
  useEffect(() => {
    const initFCM = async () => {
      const initialized = await initialize()
      if (initialized) {
        await requestPermission()
      }
    }

    initFCM()
  }, [initialize, requestPermission])

  return {
    ...state,
    initialize,
    requestPermission,
    getToken,
    sendNotification,
    subscribeToTopic,
    unsubscribeFromTopic,
    onMessageReceived
  }
}

export default useFCM 