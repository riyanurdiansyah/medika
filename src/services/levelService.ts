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
import { generateGUID } from 'src/utils/guid'

export interface ApprovalLevel {
  id: string
  name: string
  description: string
  order: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateLevelData {
  name: string
  description: string
  order: number
}

export const levelService = {
  async getAllLevels(): Promise<ApprovalLevel[]> {
    try {
      const levelsCollection = collection(db, 'approvalLevels')
      const levelsSnapshot = await getDocs(levelsCollection)
      const levels = levelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ApprovalLevel[]

      // Sort levels by order
      return levels.sort((a, b) => a.order - b.order)
    } catch (error) {
      console.error('Error fetching levels:', error)
      throw error
    }
  },

  async getLevelById(levelId: string): Promise<ApprovalLevel | null> {
    const levelDoc = doc(db, 'approvalLevels', levelId)
    const levelSnapshot = await getDoc(levelDoc)
    if (!levelSnapshot.exists()) return null
    
    const data = levelSnapshot.data()
    return {
      id: levelSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as ApprovalLevel
  },

  async createLevel(data: CreateLevelData): Promise<string> {
    try {
      const guid = generateGUID()
      const levelDoc = doc(db, 'approvalLevels', guid)
      
      await setDoc(levelDoc, {
        ...data,
        guid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return guid
    } catch (error) {
      console.error('Error creating level:', error)
      throw error
    }
  },

  async updateLevel(id: string, data: Partial<ApprovalLevel>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }

      await updateDoc(doc(db, 'approvalLevels', id), updateData)
    } catch (error) {
      console.error('Error updating level:', error)
      throw error
    }
  },

  async deleteLevel(levelId: string): Promise<void> {
    try {
      const levelDoc = doc(db, 'approvalLevels', levelId)
      await deleteDoc(levelDoc)
    } catch (error) {
      console.error('Error deleting level:', error)
      throw error
    }
  }
} 