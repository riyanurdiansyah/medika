import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, topic } = req.body

    if (!token || !topic) {
      return res.status(400).json({ error: 'Token and topic are required' })
    }

    // Use Firebase Admin SDK
    const admin = require('firebase-admin')
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    const messaging = admin.messaging()

    // Unsubscribe from topic
    const response = await messaging.unsubscribeFromTopic(token, topic)

    if (response.successCount > 0) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully unsubscribed from topic: ${topic}`,
        successCount: response.successCount,
        failureCount: response.failureCount
      })
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to unsubscribe from topic',
        failureCount: response.failureCount,
        errors: response.errors
      })
    }
  } catch (error) {
    console.error('Error unsubscribing from FCM topic:', error)
    res.status(500).json({ error: 'Failed to unsubscribe from topic' })
  }
} 