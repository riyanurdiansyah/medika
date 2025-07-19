import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Paper,
  LinearProgress,
  Button
} from '@mui/material'
import { format } from 'date-fns'
import { RequestFormM } from 'src/types/requestForm'

interface BasicInfoRequestFormProps {
  data?: Partial<RequestFormM>
  onSubmit?: (data: Partial<RequestFormM>) => void
  onNext?: (data: Partial<RequestFormM>) => void
  loading?: boolean
}

const BasicInfoRequestForm: React.FC<BasicInfoRequestFormProps> = ({
  data = {},
  onSubmit,
  onNext,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<RequestFormM>>({
    noDokumen: data.noDokumen || '',
    tanggal: data.tanggal,
    alamat: data.alamat || '',
    noTelepon: data.noTelepon || '',
    namaKepalaLab: data.namaKepalaLab || '',
    penanggungJawabAlat: data.penanggungJawabAlat || '',
    tanggalPengajuan: data.tanggalPengajuan,
    alat: data.alat || '',
    merk: data.merk || '',
    serialNumber: data.serialNumber || '',
    noInvoice: data.noInvoice || '',
    type: data.type || 'Instalasi'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof RequestFormM, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.noDokumen?.trim()) {
      newErrors.noDokumen = 'No Dokumen is required'
    }
    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal Dokumen is required'
    }
    if (!formData.alamat?.trim()) {
      newErrors.alamat = 'Alamat is required'
    }
    if (!formData.noTelepon?.trim()) {
      newErrors.noTelepon = 'No Telepon is required'
    }
    if (!formData.namaKepalaLab?.trim()) {
      newErrors.namaKepalaLab = 'Kepala Laboratorium is required'
    }
    if (!formData.penanggungJawabAlat?.trim()) {
      newErrors.penanggungJawabAlat = 'Penanggung Jawab Alat is required'
    }
    if (!formData.tanggalPengajuan) {
      newErrors.tanggalPengajuan = 'Tanggal Pengajuan Form is required'
    }
    if (!formData.alat?.trim()) {
      newErrors.alat = 'Alat is required'
    }
    if (!formData.merk?.trim()) {
      newErrors.merk = 'Merk is required'
    }
    if (!formData.serialNumber?.trim()) {
      newErrors.serialNumber = 'Serial Number is required'
    }
    if (!formData.noInvoice?.trim()) {
      newErrors.noInvoice = 'No SPK/Invoice is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData)
      } else if (onNext) {
        onNext(formData)
      }
    }
  }

  const renderTextField = (
    field: keyof RequestFormM,
    label: string,
    required: boolean = true,
    multiline: boolean = false,
    rows: number = 1,
    type: string = 'text'
  ) => (
    <TextField
      fullWidth
      label={label}
      value={formData[field] || ''}
      onChange={(e) => handleInputChange(field, e.target.value)}
      error={!!errors[field]}
      helperText={errors[field]}
      required={required}
      multiline={multiline}
      rows={rows}
      type={type}
      sx={{
        '& .MuiInputLabel-root': {
          fontSize: '18px',
          color: 'text.secondary'
        },
        '& .MuiInputBase-input': {
          fontSize: '18px',
          color: 'text.primary'
        },
        '& .MuiFormHelperText-root': {
          fontSize: '14px'
        }
      }}
    />
  )

  const renderDateField = (
    field: keyof RequestFormM,
    label: string,
    required: boolean = true
  ) => {
    const getDateValue = (dateField: any) => {
      if (!dateField) return ''
      
      try {
        // Handle Firestore Timestamp
        if (dateField && typeof dateField === 'object' && dateField.toDate) {
          return format(dateField.toDate(), 'yyyy-MM-dd')
        }
        // Handle regular Date object or date string
        if (dateField instanceof Date || typeof dateField === 'string') {
          return format(new Date(dateField), 'yyyy-MM-dd')
        }
        return ''
      } catch (error) {
        console.error('Error formatting date:', error)
        return ''
      }
    }

    return (
      <TextField
        fullWidth
        label={label}
        type="date"
        value={getDateValue(formData[field])}
        onChange={(e) => handleInputChange(field, e.target.value)}
        error={!!errors[field]}
        helperText={errors[field]}
        required={required}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiInputLabel-root': {
            fontSize: '18px',
            color: 'text.secondary'
          },
          '& .MuiInputBase-input': {
            fontSize: '18px',
            color: 'text.primary'
          },
          '& .MuiFormHelperText-root': {
            fontSize: '14px'
          }
        }}
      />
    )
  }

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      py: 2
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          p: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              fontSize: '16px',
              color: 'text.primary',
              mb: 0.5
            }}
          >
            Create a new request {formData.type}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 400, 
              fontSize: '16px',
              color: 'text.secondary',
              mb: 2
            }}
          >
            1 of 3 Completed Basic Info
          </Typography>
          
          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={33} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }} 
          />
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* No Dokumen */}
          {renderTextField('noDokumen', 'No Dokumen')}

          {/* Tanggal Dokumen */}
          {renderDateField('tanggal', 'Tanggal Dokumen')}

          {/* Alamat */}
          {renderTextField('alamat', 'Alamat', true, true, 3)}

          {/* No Telepon */}
          {renderTextField('noTelepon', 'No Telepon', true, false, 1, 'tel')}

          {/* Kepala Laboratorium */}
          {renderTextField('namaKepalaLab', 'Kepala Laboratorium')}

          {/* Penanggung Jawab Alat */}
          {renderTextField('penanggungJawabAlat', 'Penanggung Jawab Alat')}

          {/* Tanggal Pengajuan Form */}
          {renderDateField('tanggalPengajuan', 'Tanggal Pengajuan Form')}

          {/* Alat */}
          {renderTextField('alat', 'Alat')}

          {/* Merk */}
          {renderTextField('merk', 'Merk')}

          {/* Serial Number */}
          {renderTextField('serialNumber', 'Serial Number')}

          {/* No SPK/Invoice */}
          {renderTextField('noInvoice', 'No SPK/Invoice')}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.history.back()}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            {loading ? 'Saving...' : (onNext ? 'Next' : 'Save')}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default BasicInfoRequestForm 