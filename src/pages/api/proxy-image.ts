import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    // Add headers to bypass CORS for Firebase Storage
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Proxy/1.0)',
    }

    // For Firebase Storage URLs, we might need to handle authentication
    if (url.includes('firebasestorage.googleapis.com')) {
      // You can add Firebase authentication here if needed
      // For now, we'll try to fetch without additional auth
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' })
    }

    const contentType = response.headers.get('content-type')
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Error proxying image:', error)
    res.status(500).json({ error: 'Failed to proxy image' })
  }
} 