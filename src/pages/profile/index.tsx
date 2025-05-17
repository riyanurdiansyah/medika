// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import UserMenu from 'src/components/users/UserMenu'

// ** Context Imports
import { useAuth } from 'src/hooks/useAuth'

// ** Types
import { UserData } from 'src/types/user'

const ProfileDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > *': {
    marginRight: theme.spacing(4)
  }
}))

const InfoRow = ({ label, value }: { label: string; value: string | null }) => (
  <Box sx={{ display: 'flex', mb: 3 }}>
    <Typography sx={{ mr: 2, fontWeight: 600, width: 150 }}>{label}:</Typography>
    <Typography>{value || '-'}</Typography>
  </Box>
)

const ProfilePage = () => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  // Convert auth user to UserData type
  const userData: UserData = {
    id: user.id,
    email: user.email,
    fullname: user.fullname,
    displayName: user.fullname,
    username: user.username || '',
    avatar: user.avatar || null,
    role: user.role,
    status: 'active'
  }

  return (
    <Box sx={{ p: 4 }}>
      <UserMenu user={userData} />
      <Grid container spacing={6}>
        <PageHeader
          title={<h5>Profile</h5>}
          subtitle={<>View and manage your profile information</>}
        />
        
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Profile Details' />
            <CardContent>
              <ProfileDetails>
                <Avatar
                  src={userData.avatar || undefined}
                  alt={userData.fullname}
                  sx={{ width: 120, height: 120, mr: 4 }}
                >
                  {userData.fullname?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant='h5' sx={{ mb: 1 }}>
                    {userData.fullname}
                  </Typography>
                  <Typography color='text.secondary'>
                    <Icon icon='tabler:shield' fontSize={20} style={{ verticalAlign: 'middle' }} />
                    <span style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                      {userData.role}
                    </span>
                  </Typography>
                </Box>
              </ProfileDetails>

              <Divider sx={{ my: 4 }} />

              <Box>
                <InfoRow label='Username' value={userData.username} />
                <InfoRow label='Email' value={userData.email} />
                <InfoRow label='Full Name' value={userData.fullname} />
                <InfoRow label='Role' value={userData.role} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage 