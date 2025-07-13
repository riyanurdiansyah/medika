import type { NextApiRequest, NextApiResponse } from 'next/types'
import { fcmService } from 'src/services/fcmService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET method for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { limit = '50' } = req.query
    const limitNumber = parseInt(limit as string, 10)

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 100'
      })
    }

    const messages = await fcmService.getMessageHistory(limitNumber)
    
    return res.status(200).json({
      success: true,
      data: messages,
      count: messages.length
    })

  } catch (error) {
    console.error('Error fetching FCM messages:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 