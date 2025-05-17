import { useRouter } from 'next/router'
import { Alert, Box, Tab, Tabs } from '@mui/material'
import OfferList from 'src/components/offers/OfferList'
import { useOffers } from 'src/hooks/useOffers'
import { useAuth } from 'src/hooks/useAuth'
import { useState } from 'react'

const APPROVAL_ROLES = ['supervisor', 'manager', 'director']

const ApprovalsPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const { offers, loading, error, refreshOffers } = useOffers(selectedRole || undefined)

  // Redirect if user doesn't have approval permissions
  if (user && !APPROVAL_ROLES.includes(user.role)) {
    router.replace('/offers')
    return null
  }

  // Set initial role based on user's role if not set
  if (user && !selectedRole && APPROVAL_ROLES.includes(user.role)) {
    setSelectedRole(user.role)
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Only show role tabs for admin users who can see all approval queues */}
      {user?.role === 'admin' && (
        <Tabs
          value={selectedRole}
          onChange={(_, newValue) => setSelectedRole(newValue)}
          sx={{ mb: 4 }}
        >
          {APPROVAL_ROLES.map(role => (
            <Tab
              key={role}
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              value={role}
            />
          ))}
        </Tabs>
      )}

      <OfferList
        offers={offers}
        loading={loading}
        userRole={selectedRole || undefined}
        onRefresh={refreshOffers}
      />
    </Box>
  )
}

export default ApprovalsPage 