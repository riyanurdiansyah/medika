import { useState } from 'react'
import { useRouter } from 'next/router'
import { Alert, Box } from '@mui/material'
import OfferList from 'src/components/offers/OfferList'
import OfferForm from 'src/components/offers/OfferForm'
import { useOffers } from 'src/hooks/useOffers'

const OffersPage = () => {
  const router = useRouter()
  const { offers, loading, error, refreshOffers } = useOffers()
  const [showForm, setShowForm] = useState(false)

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ p: 4 }}>
      {showForm ? (
        <OfferForm />
      ) : (
        <OfferList
          offers={offers}
          loading={loading}
          onAddOffer={() => setShowForm(true)}
          onRefresh={refreshOffers}
        />
      )}
    </Box>
  )
}

export default OffersPage 