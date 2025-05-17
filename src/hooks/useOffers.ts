import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { ProductOffer } from 'src/types/productOffer'
import { useAuth } from './useAuth'

export const useOffers = (userRole?: string) => {
  const { user } = useAuth()
  const [offers, setOffers] = useState<ProductOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const offersCollection = collection(db, 'productOffers')
      const offersSnapshot = await getDocs(offersCollection)
      const offersList = offersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ProductOffer[]

      // Filter offers based on user role and permissions
      let filteredOffers = offersList
      if (user && !['admin', 'Super Admin'].includes(user.role)) {
        if (userRole) {
          // For approval views, show only pending offers that need this role's approval
          filteredOffers = offersList.filter(offer => 
            offer.status === 'pending' &&
            offer.approvalSteps.some(step => 
              step.role === userRole && step.status === 'pending'
            )
          )
        } else {
          // For normal views, show only user's own offers
          filteredOffers = offersList.filter(offer => offer.submitterId === user.id)
        }
      }

      setOffers(filteredOffers)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [user, userRole])

  return { offers, loading, error, refreshOffers: fetchOffers }
} 