// ** React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Tooltip
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Icon from 'src/@core/components/icon'
import { levelService } from 'src/services/levelService'
import toast from 'react-hot-toast'

interface LevelFormData {
  name: string
  description: string
  order: number
}

interface ApprovalLevel {
  id: string
  name: string
  description: string
  order: number
  createdAt?: Date
  updatedAt?: Date
}

const defaultFormData: LevelFormData = {
  name: '',
  description: '',
  order: 1
}

const LevelManagementPage = () => {
  const router = useRouter()
  const [levels, setLevels] = useState<ApprovalLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<LevelFormData>(defaultFormData)
  const [selectedLevel, setSelectedLevel] = useState<ApprovalLevel | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const data = await levelService.getAllLevels()
      setLevels(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching levels:', err)
      setError('Failed to fetch levels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  const handleLevelSelect = (levelId: string) => {
    const level = levels.find(l => l.id === levelId)
    if (level) {
      setSelectedLevel(level)
      setFormData({
        name: level.name,
        description: level.description,
        order: level.order
      })
      setOpenDialog(true)
    }
  }

  const handleAddLevel = () => {
    setSelectedLevel(null)
    setFormData(defaultFormData)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLevel(null)
    setFormData(defaultFormData)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      if (!formData.name || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      // Check if order is already taken
      const existingLevelWithOrder = levels.find(l => l.order === formData.order && l.id !== selectedLevel?.id)
      if (existingLevelWithOrder) {
        toast.error(`Order ${formData.order} is already assigned to level "${existingLevelWithOrder.name}"`)
        return
      }

      if (selectedLevel) {
        // Update existing level
        await levelService.updateLevel(selectedLevel.id, {
          name: formData.name,
          description: formData.description,
          order: formData.order
        })
        toast.success('Level updated successfully')
      } else {
        // Create new level
        await levelService.createLevel({
          name: formData.name,
          description: formData.description,
          order: formData.order
        })
        toast.success('Level created successfully')
      }

      handleCloseDialog()
      fetchLevels()
    } catch (err) {
      console.error('Error saving level:', err)
      toast.error('Failed to save level')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 2,
      minWidth: 150 
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 3,
      minWidth: 200 
    },
    {
      field: 'order',
      headerName: 'Order',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.order}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleLevelSelect(params.row.id)}
              color="primary"
            >
              <Icon icon="tabler:edit" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<h5>Approval Level Management</h5>}
        subtitle={<>Manage approval levels and their order</>}
      />
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mr: 2 }}>Approval Levels</Typography>
                <Tooltip title="Levels are ordered by their order number. Higher numbers have more permissions.">
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    <Icon icon="mdi:information-outline" fontSize={20} />
                  </Box>
                </Tooltip>
              </Box>
            }
            action={
              <Button
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
                onClick={handleAddLevel}
              >
                Add Level
              </Button>
            }
          />
          <CardContent>
            <DataGrid
              rows={levels}
              columns={columns}
              loading={loading}
              autoHeight
              pagination
              disableRowSelectionOnClick 
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 }
                },
                sorting: {
                  sortModel: [{ field: 'order', sort: 'asc' }]
                }
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            {selectedLevel ? 'Edit Level' : 'Add New Level'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="Level Name"
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
                required
                sx={{ mb: 4 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                disabled={submitting}
                required
                inputProps={{ min: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.description}
            >
              {submitting ? 'Saving...' : selectedLevel ? 'Update Level' : 'Add Level'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default LevelManagementPage 