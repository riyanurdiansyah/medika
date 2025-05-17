import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material'
import { useAuth } from 'src/hooks/useAuth'
import { productOfferService } from 'src/services/productOfferService'
import toast from 'react-hot-toast'

interface OfferFormData {
  name: string
  description: string
  price: number
  category: string
}

const defaultFormData: OfferFormData = {
  name: '',
  description: '',
  price: 0,
  category: ''
}

const categories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Others'
]

// Define the approval workflow based on roles
const approvalWorkflow = [
  { role: 'supervisor', order: 0 },
  { role: 'manager', order: 1 },
  { role: 'director', order: 2 }
]

interface OfferFormProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

const OfferForm = ({ open, onClose, onSubmit }: OfferFormProps) => {
  const [formData, setFormData] = useState<OfferFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!formData.name || !formData.description || !formData.category || formData.price <= 0) {
        toast.error('Please fill in all required fields')
        return
      }

      // Create approval steps based on workflow
      const approvalSteps = approvalWorkflow.map(step => ({
        ...step,
        status: 'pending' as const,
        approvedBy: undefined,
        approvedAt: undefined,
        comments: undefined
      }))

      await productOfferService.createOffer({
        ...formData,
        submittedBy: user?.id || '',
        submittedAt: new Date(),
        status: 'pending',
        currentApprovalStep: 0,
        approvalSteps
      })

      toast.success('Offer submitted successfully')
      onSubmit()
      handleClose()
    } catch (err) {
      console.error('Error submitting offer:', err)
      toast.error('Failed to submit offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData(defaultFormData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Product Offer</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={submitting}
            sx={{ mb: 4 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            disabled={submitting}
            sx={{ mb: 4 }}
            required
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            disabled={submitting}
            sx={{ mb: 4 }}
            required
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={submitting}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
            This offer will require approval from: {approvalWorkflow.map(step => step.role).join(' → ')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !formData.name || !formData.description || !formData.category || formData.price <= 0}
        >
          {submitting ? 'Submitting...' : 'Submit Offer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OfferForm 