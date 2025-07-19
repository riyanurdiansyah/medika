// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    // Only redirect if we have user data in localStorage and we're not already on a protected page
    const userData = window.localStorage.getItem('userData')
    if (userData && router.pathname === '/login') {
      // Parse the user data to check if it's valid
      try {
        const parsedUserData = JSON.parse(userData)
        if (parsedUserData && parsedUserData.id) {
          router.replace('/')
        }
      } catch (error) {
        // If localStorage data is invalid, remove it
        window.localStorage.removeItem('userData')
      }
    }
  }, [router.isReady, router.pathname, router])

  if (auth.loading || (!auth.loading && auth.user !== null)) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
