import type { NextApiRequest, NextApiResponse } from 'next/types'
import { userService } from 'src/services/userService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  // Validate user ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get user by ID
        const user = await userService.getUserById(id)
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          })
        }

        return res.status(200).json({
          success: true,
          data: user
        })

      case 'PUT':
        // Update user
        const updateData = req.body
        await userService.updateUser(id, updateData)
        
        return res.status(200).json({
          success: true,
          message: 'User updated successfully'
        })

      case 'DELETE':
        // Delete user
        await userService.deleteUser(id)
        
        return res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        })

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        })
    }
  } catch (error) {
    console.error('Error handling user request:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 