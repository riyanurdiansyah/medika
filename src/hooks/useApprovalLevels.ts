import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/configs/firebase'

interface ApprovalLevel {
  level: number
  role: string
  title: string
}

export const useApprovalLevels = () => {
  const [levels, setLevels] = useState<ApprovalLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApprovalLevels = async () => {
      try {
        setLoading(true)
        const approvalSettingsRef = doc(db, 'settings', 'approvalFlow')
        const approvalSettingsDoc = await getDoc(approvalSettingsRef)
        
        if (approvalSettingsDoc.exists()) {
          setLevels(approvalSettingsDoc.data().levels)
        } else {
          // Default levels if not set
          setLevels([
            { level: 1, role: 'sales', title: 'Sales' },
            { level: 2, role: 'supervisor', title: 'Supervisor' },
            { level: 3, role: 'manager', title: 'Manager' },
            { level: 4, role: 'deputy-manager', title: 'Deputy Manager' }
          ])
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching approval levels:', err)
        setError('Failed to fetch approval levels')
      } finally {
        setLoading(false)
      }
    }

    fetchApprovalLevels()
  }, [])

  const getRoleLevel = (role: string): number => {
    const level = levels.find(l => l.role === role)
    return level?.level || 0
  }

  const getHigherLevelRoles = (role: string): string[] => {
    const currentLevel = getRoleLevel(role)
    return levels
      .filter(l => l.level > currentLevel)
      .map(l => l.role)
  }

  return { levels, loading, error, getRoleLevel, getHigherLevelRoles }
} 