import type { NextApiRequest, NextApiResponse } from 'next/types'
import { fcmService } from 'src/services/fcmService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'POST':
        // Save device token
        const { userId, deviceToken, deviceType, deviceInfo } = req.body

        if (!userId || !deviceToken || !deviceType) {
          return res.status(400).json({
            success: false,
            error: 'userId, deviceToken, and deviceType are required'
          })
        }

        const tokenId = await fcmService.saveDeviceToken(userId, deviceToken, deviceType, deviceInfo)
        
        return res.status(200).json({
          success: true,
          message: 'Device token saved successfully',
          data: { tokenId }
        })

      case 'GET':
        // Get device tokens
        const { userId: queryUserId } = req.query

        if (queryUserId) {
          // Get tokens for specific user
          const userTokens = await fcmService.getUserDeviceTokens(queryUserId as string)
          return res.status(200).json({
            success: true,
            data: userTokens
          })
        } else {
          // Get all active tokens
          const allTokens = await fcmService.getAllActiveDeviceTokens()
          return res.status(200).json({
            success: true,
            data: allTokens
          })
        }

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Error handling FCM tokens:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 