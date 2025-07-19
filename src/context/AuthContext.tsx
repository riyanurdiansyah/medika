// ** React Imports
import { createContext, useEffect, useState, ReactNode, useCallback } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Firebase Imports
import { auth, db } from 'src/configs/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [initializing, setInitializing] = useState(true)

  // ** Hooks
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      window.localStorage.removeItem('userData')
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserDataType, 'id' | 'email'>
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              ...userData
            })
          } else {
            // Handle case where user document doesn't exist
            console.error('User document not found in Firestore')
            await handleLogout()
          }
        } else {
          setUser(null)
          // Only redirect to login if we're not on login, register, or public pages
          const publicPaths = ['/login', '/register', '/']
          if (!publicPaths.includes(router.pathname)) {
            router.replace('/login')
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
      } finally {
        setLoading(false)
        setInitializing(false)
      }
    })

    return () => unsubscribe()
  }, [router, handleLogout]) // Added missing dependencies

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      setLoading(true)
      const { email, password } = params
      
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserDataType, 'id' | 'email'>
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          ...userData
        }

        // Store user data in localStorage if rememberMe is true
        if (params.rememberMe) {
          window.localStorage.setItem('userData', JSON.stringify(user))
        }

        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        
        // Set user after successful login
        setUser(user)
        
        // Navigate after everything is set
        router.replace(redirectURL as string)
      } else {
        throw new Error('User document not found in Firestore')
      }
    } catch (err: any) {
      if (errorCallback) errorCallback(err)
    } finally {
      setLoading(false)
    }
  }

  const values = {
    user,
    loading: loading || initializing, // Combine loading states
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  // Don't render children until initial auth check is complete
  if (initializing) {
    return null
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
