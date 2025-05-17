import { useState } from 'react'
import { 
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert
} from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { productOfferService } from 'src/services/productOfferService'
import { CreateProductOfferData } from 'src/types/productOffer'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Other'
]

interface FormData {
  name: string
  description: string
  price: string
  category: string
}

const defaultFormData: FormData = {
  name: '',
  description: '',
  price: '',
  category: ''
}

const OfferForm = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof FormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Product description is required')
      return false
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Please enter a valid price')
      return false
    }
    if (!formData.category) {
      setError('Please select a category')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      setError(null)

      const offerData: CreateProductOfferData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        submitterId: user?.id || '',
        submitterName: user?.fullName || ''
      }

      await productOfferService.createOffer(offerData)
      
      toast.success('Product offer submitted successfully')
      setFormData(defaultFormData)
    } catch (err) {
      console.error('Error submitting offer:', err)
      setError('Failed to submit product offer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>Submit Product Offer</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Product Name"
        value={formData.name}
        onChange={handleChange('name')}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        margin="normal"
        required
        multiline
        rows={4}
      />

      <TextField
        fullWidth
        label="Price"
        type="number"
        value={formData.price}
        onChange={handleChange('price')}
        margin="normal"
        required
        inputProps={{ min: 0, step: 0.01 }}
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Category</InputLabel>
        <Select
          value={formData.category}
          onChange={handleChange('category')}
          label="Category"
        >
          {CATEGORIES.map(category => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={submitting}
        sx={{ mt: 4 }}
      >
        {submitting ? 'Submitting...' : 'Submit Offer'}
      </Button>
    </Box>
  )
}

export default OfferForm 