import { useState, useEffect } from 'react'
import { levelService, ApprovalLevel } from 'src/services/levelService'

export const useLevels = () => {
  const [levels, setLevels] = useState<ApprovalLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const data = await levelService.getAllLevels()
      setLevels(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch levels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  return { levels, loading, error, refreshLevels: fetchLevels }
} 