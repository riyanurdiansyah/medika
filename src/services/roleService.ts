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
  level: number
}

export const roleService = {
  async getAllRoles(): Promise<UserRole[]> {
    const rolesCollection = collection(db, 'roles')
    const rolesSnapshot = await getDocs(rolesCollection)
    return rolesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      status: doc.data().status || 'active',
      level: doc.data().level || 1
    })) as UserRole[]
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
    const guid = generateGUID()
    const roleDoc = doc(db, 'roles', guid)
    
    await setDoc(roleDoc, {
      ...data,
      guid,
      status: data.status || 'active',
      level: data.level || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return guid
  },

  async updateRole(roleId: string, data: Partial<UserRole>): Promise<void> {
    const roleDoc = doc(db, 'roles', roleId)
    await updateDoc(roleDoc, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  async deleteRole(roleId: string): Promise<void> {
    const roleDoc = doc(db, 'roles', roleId)
    await deleteDoc(roleDoc)
  },

  async getSystemRoles(): Promise<UserRole[]> {
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
  }
} 