import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where
} from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { UserData } from 'src/types/user'

export interface ApprovalChain {
  userId: string
  level: number
  user: UserData
}

export const approvalChainService = {
  async getApprovalChain(userId: string): Promise<ApprovalChain[]> {
    try {
      const chain: ApprovalChain[] = []
      let currentUserId = userId
      let level = 1

      while (currentUserId) {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', currentUserId))
        if (!userDoc.exists()) break

        const userData = userDoc.data() as UserData
        chain.push({
          userId: currentUserId,
          level,
          user: userData
        })

        // If no direct superior, break the chain
        if (!userData.directSuperior) break

        // Move to next superior
        currentUserId = userData.directSuperior
        level++
      }

      return chain
    } catch (error) {
      console.error('Error getting approval chain:', error)
      throw error
    }
  },

  async getNextApprover(userId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) return null

      const userData = userDoc.data() as UserData
      if (!userData.directSuperior) return null

      const superiorDoc = await getDoc(doc(db, 'users', userData.directSuperior))
      if (!superiorDoc.exists()) return null

      return superiorDoc.data() as UserData
    } catch (error) {
      console.error('Error getting next approver:', error)
      throw error
    }
  },

  async getApprovalLevel(userId: string): Promise<number> {
    try {
      const chain = await this.getApprovalChain(userId)
      return chain.length
    } catch (error) {
      console.error('Error getting approval level:', error)
      throw error
    }
  }
} 