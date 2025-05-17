import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography
} from '@mui/material'
import { RequestType } from 'src/types/request'
import Icon from 'src/@core/components/icon'

interface RequestFormProps {
  onSubmit: (data: {
    title: string
    description: string
    type: RequestType
    estimatedCost?: number
  }) => void
  onCancel: () => void
}

const RequestForm = ({ onSubmit, onCancel }: RequestFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<RequestType>('goods')
  const [estimatedCost, setEstimatedCost] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      type,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined
    })
  }

  return (
    <Card>
      <CardHeader title="New Request" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={type}
                  label="Type"
                  onChange={(e) => setType(e.target.value as RequestType)}
                >
                  <MenuItem value="goods">Goods</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 2 }}>$</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<Icon icon="tabler:send" />}>
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RequestForm 