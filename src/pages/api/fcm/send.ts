import type { NextApiRequest, NextApiResponse } from 'next/types'
import { FCMRequest } from 'src/services/fcmNotificationService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const request: FCMRequest = req.body

    // Validate required fields
    if (!request.notification || !request.notification.title || !request.notification.body) {
      return res.status(400).json({ error: 'Notification title and body are required' })
    }

    // Check if we have a target (to, registrationIds, or topic)
    if (!request.to && !request.registrationIds && !request.topic) {
      return res.status(400).json({ error: 'Either to, registrationIds, or topic is required' })
    }

    // Use Firebase Admin SDK to send the message
    const admin = require('firebase-admin')
    
    // Check if environment variables are set
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is not set')
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('FIREBASE_CLIENT_EMAIL environment variable is not set')
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
    }
    
    if (!admin.apps.length) {
      // Clean up the private key - remove quotes and handle newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    }

    const messaging = admin.messaging()

    // Prepare the message
    const message: any = {
      notification: {
        title: request.notification.title,
        body: request.notification.body,
        ...(request.notification.icon && { icon: request.notification.icon }),
        ...(request.notification.clickAction && { clickAction: request.notification.clickAction }),
      },
      ...(request.data && { data: request.data }),
      ...(request.priority && { priority: request.priority }),
      ...(request.collapseKey && { collapseKey: request.collapseKey }),
      ...(request.timeToLive && { ttl: request.timeToLive }),
      ...(request.delayWhileIdle && { delayWhileIdle: request.delayWhileIdle }),
    }

    let response
    if (request.to) {
      // Send to specific token
      response = await messaging.send({
        ...message,
        token: request.to,
      })
    } else if (request.registrationIds) {
      // Send to multiple tokens
      response = await messaging.sendMulticast({
        ...message,
        tokens: request.registrationIds,
      })
    } else if (request.topic) {
      // Send to topic
      response = await messaging.send({
        ...message,
        topic: request.topic,
      })
    }

    res.status(200).json({ 
      success: true, 
      messageId: response?.messageId || response?.responses?.[0]?.messageId,
      response 
    })
  } catch (error) {
    console.error('Error sending FCM notification:', error)
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to send notification'
    if (error instanceof Error) {
      if (error.message.includes('FIREBASE_PROJECT_ID')) {
        errorMessage = 'Firebase configuration error: Project ID not set. Please check your .env.local file.'
      } else if (error.message.includes('FIREBASE_CLIENT_EMAIL')) {
        errorMessage = 'Firebase configuration error: Client email not set. Please check your .env.local file.'
      } else if (error.message.includes('FIREBASE_PRIVATE_KEY')) {
        errorMessage = 'Firebase configuration error: Private key not set. Please check your .env.local file.'
      } else if (error.message.includes('project_id')) {
        errorMessage = 'Firebase configuration error: Invalid service account credentials. Please check your .env.local file.'
      } else {
        errorMessage = error.message
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 