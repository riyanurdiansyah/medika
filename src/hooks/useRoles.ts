import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { UserRole } from 'src/types/user'

export const useRoles = () => {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const rolesCollection = collection(db, 'roles')
      const rolesSnapshot = await getDocs(rolesCollection)
      const rolesList = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserRole[]
      setRoles(rolesList)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return { roles, loading, error, refreshRoles: fetchRoles }
} 