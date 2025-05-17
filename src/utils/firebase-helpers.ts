import { db } from 'src/configs/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { UserDataType } from 'src/context/types'

export const createUserInFirestore = async (
  uid: string,
  userData: Omit<UserDataType, 'id' | 'email' | 'password'>
) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      role: userData.role || 'client', // Default role
      fullName: userData.fullName || '',
      username: userData.username || '',
      avatar: userData.avatar || null
    })
  } catch (error) {
    console.error('Error creating user in Firestore:', error)
    throw error
  }
}

// Add more helper functions as needed 