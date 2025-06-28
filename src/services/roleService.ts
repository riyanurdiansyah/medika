import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { UserRole } from 'src/types/user'
import { generateGUID } from 'src/utils/guid'

export interface CreateRoleData extends Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'> {
  status: 'active' | 'inactive'
  level: string
}

export const roleService = {
  async getAllRoles(): Promise<UserRole[]> {
    try {
      const rolesCollection = collection(db, 'roles')
      const rolesSnapshot = await getDocs(rolesCollection)
      const roles = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        status: doc.data().status || 'active',
        level: doc.data().level || ''
      })) as UserRole[]

      // Get levels for sorting
      const levelsCollection = collection(db, 'approvalLevels')
      const levelsSnapshot = await getDocs(levelsCollection)
      const levels = levelsSnapshot.docs.map(doc => ({
        id: doc.id,
        order: doc.data().order
      }))

      // Sort roles by level order
      return roles.sort((a, b) => {
        const levelA = levels.find(l => l.id === a.level)?.order || 0
        const levelB = levels.find(l => l.id === b.level)?.order || 0
        return levelA - levelB
      })
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  },

  async getRoleById(roleId: string): Promise<UserRole | null> {
    const roleDoc = doc(db, 'roles', roleId)
    const roleSnapshot = await getDoc(roleDoc)
    if (!roleSnapshot.exists()) return null
    
    const data = roleSnapshot.data()
    return {
      id: roleSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      status: data.status || 'active',
      level: data.level || 1
    } as UserRole
  },

  async createRole(data: CreateRoleData): Promise<string> {
    try {
      const guid = generateGUID()
      const roleDoc = doc(db, 'roles', guid)
      
      await setDoc(roleDoc, {
        ...data,
        guid,
        status: data.status || 'active',
        level: data.level,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return guid
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  async updateRole(id: string, data: Partial<UserRole>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }

      await updateDoc(doc(db, 'roles', id), updateData)
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  },

  async deleteRole(roleId: string): Promise<void> {
    try {
      const roleDoc = doc(db, 'roles', roleId)
      await deleteDoc(roleDoc)
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  },

  async getSystemRoles(): Promise<UserRole[]> {
    try {
      const rolesCollection = collection(db, 'roles')
      const q = query(rolesCollection, where('isSystem', '==', true))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        status: doc.data().status || 'active',
        level: doc.data().level || 1
      })) as UserRole[]
    } catch (error) {
      console.error('Error fetching system roles:', error)
      throw error
    }
  }
} 