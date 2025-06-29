import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/configs/firebase'

export interface ApprovalLevel {
  id: string
  name: string
  level: number
  description?: string
}

export const useApprovalLevels = () => {
  const [levels, setLevels] = useState<ApprovalLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const levelsCollection = collection(db, 'approvalLevels')
        const snapshot = await getDocs(levelsCollection)
        const levelsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ApprovalLevel[]
        
        // Sort by level
        levelsData.sort((a, b) => a.level - b.level)
        setLevels(levelsData)
      } catch (err) {
        console.error('Error fetching approval levels:', err)
        setError('Failed to fetch approval levels')
      } finally {
        setLoading(false)
      }
    }

    fetchLevels()
  }, [])

  // Get roles that are at a higher level than the given role
  const getHigherLevelRoles = (currentRole: string): string[] => {
    const currentLevel = levels.find(level => level.name === currentRole)?.level || 0
    return levels
      .filter(level => level.level > currentLevel)
      .map(level => level.name)
  }

  return { levels, loading, error, getHigherLevelRoles }
} 