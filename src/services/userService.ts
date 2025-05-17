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
import { UserData } from 'src/types/user'
import { generateGUID } from 'src/utils/guid'

export interface CreateUserData extends Omit<UserData, 'id' | 'createdAt' | 'updatedAt'> {
  password: string
}

export const userService = {
  async getAllUsers(): Promise<UserData[]> {
    const usersCollection = collection(db, 'users')
    const usersSnapshot = await getDocs(usersCollection)
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as UserData[]
  },

  async getUserById(userId: string): Promise<UserData | null> {
    const userDoc = doc(db, 'users', userId)
    const userSnapshot = await getDoc(userDoc)
    if (!userSnapshot.exists()) return null
    
    const data = userSnapshot.data()
    return {
      id: userSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as UserData
  },

  async createUser(data: CreateUserData): Promise<string> {
    const guid = generateGUID()
    const userDoc = doc(db, 'users', guid)
    
    await setDoc(userDoc, {
      ...data,
      guid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return guid
  },

  async updateUser(userId: string, data: Partial<UserData>): Promise<void> {
    const userDoc = doc(db, 'users', userId)
    await updateDoc(userDoc, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  async deleteUser(userId: string): Promise<void> {
    const userDoc = doc(db, 'users', userId)
    await deleteDoc(userDoc)
  },

  async getUsersByRole(role: string): Promise<UserData[]> {
    const usersCollection = collection(db, 'users')
    const q = query(usersCollection, where('role', '==', role))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as UserData[]
  }
} 