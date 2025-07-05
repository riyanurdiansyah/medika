import { db } from 'src/configs/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { UserDataType } from 'src/context/types'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from 'src/configs/firebase'

export const createUserInFirestore = async (
  uid: string,
  userData: Omit<UserDataType, 'id' | 'email' | 'password'>
) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      role: userData.role || 'client', // Default role
      fullname: userData.fullname || '',
      username: userData.username || '',
      avatar: userData.avatar || null
    })
  } catch (error) {
    console.error('Error creating user in Firestore:', error)
    throw error
  }
}

/**
 * Get a download URL for a Firebase Storage file
 * This method uses the Firebase SDK which handles CORS properly
 */
export const getFirebaseStorageURL = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error getting Firebase Storage URL:', error)
    throw error
  }
}

/**
 * Check if a URL is from Firebase Storage
 */
export const isFirebaseStorageURL = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')
}

/**
 * Extract file path from Firebase Storage URL
 */
export const extractFirebaseStoragePath = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'firebasestorage.googleapis.com') {
      // Extract the file path from the URL
      const pathMatch = url.match(/\/o\/([^?]+)/)
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1])
      }
    }
    return null
  } catch (error) {
    console.error('Error extracting Firebase Storage path:', error)
    return null
  }
}

// Add more helper functions as needed 