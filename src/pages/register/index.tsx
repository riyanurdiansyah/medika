// ** React Imports
import { ReactNode, useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Firebase Imports
import { auth, db } from 'src/configs/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 600,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const systemRoles = ['Super Admin', 'admin']

interface Role {
  id: string
  name: string
  description: string
  isSystemRole: boolean
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  fullName: yup.string().required(),
  username: yup.string().required(),
  role: yup.string().required()
})

const defaultValues = {
  email: '',
  password: '',
  fullName: '',
  username: '',
  role: 'subscriber'
}

interface FormData {
  email: string
  password: string
  fullName: string
  username: string
  role: string
}

const RegisterPage = () => {
  // ** States
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [roles, setRoles] = useState<Role[]>([])

  // ** Hooks
  const theme = useTheme()
  const router = useRouter()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // Fetch roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesCollection = collection(db, 'roles')
        const rolesSnapshot = await getDocs(rolesCollection)
        const rolesList = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isSystemRole: systemRoles.includes(doc.id)
        })) as Role[]
        setRoles(rolesList)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }

    fetchRoles()
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Save additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        role: data.role,
        avatar: null
      })

      // After successful registration, redirect to home
      router.push('/home')
    } catch (err: any) {
      setError(err.message || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <RegisterIllustration
            alt='register-illustration'
            src={`/images/pages/auth-v2-register-illustration-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                Adventure starts here 🚀
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Make your app management easy and fun!</Typography>
            </Box>
            {error && (
              <Box sx={{ mb: 4 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='fullName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      autoFocus
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      label='Full Name'
                      placeholder='John Doe'
                      error={Boolean(errors.fullName)}
                    />
                  )}
                />
                {errors.fullName && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.fullName.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='username'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      label='Username'
                      placeholder='johndoe'
                      error={Boolean(errors.username)}
                    />
                  )}
                />
                {errors.username && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.username.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      label='Email'
                      placeholder='user@email.com'
                      error={Boolean(errors.email)}
                    />
                  )}
                />
                {errors.email && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id='role-select-label' error={Boolean(errors.role)}>Role</InputLabel>
                <Controller
                  name='role'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Select
                      label='Role'
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      error={Boolean(errors.role)}
                      labelId='role-select-label'
                    >
                      {roles.map(role => (
                        <MenuItem 
                          key={role.id} 
                          value={role.id}
                          disabled={role.isSystemRole}
                        >
                          {role.name}
                          {role.isSystemRole && ' (Restricted)'}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.role && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.role.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 4 }}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextField
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      label='Password'
                      type='password'
                      error={Boolean(errors.password)}
                    />
                  )}
                />
                {errors.password && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>
                )}
              </FormControl>
              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                sx={{ mb: 4 }}
                disabled={loading}
              >
                {loading ? 'Please wait...' : 'Sign up'}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
                <Typography component={Link} href='/login' sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign in instead
                </Typography>
              </Box>
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

RegisterPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

RegisterPage.guestGuard = true

export default RegisterPage
