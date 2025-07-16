import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  MenuItem
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'

interface FormItem {
  id: string
  namaItem: string
  jumlah: number
  satuan: string
  status: string
}

interface ApprovalItem {
  nama: string
  tanggal: any
  status: string
  isFinalStatus: boolean
  signature: string
  note: string
}

interface FormState {
  namaRS: string
  alamat: string
  noTelepon: string
  alat: string
  merk: string
  namaKepalaLab: string
  serialNumber: string
  penanggungJawabAlat: string
  noInvoice: string
  businessRepresentivePerson: string
  technicalSupport: string
  fieldServiceEngineer: string
  praInstalasi: string
  pic: string
  divisi: string
  onlineOffline: string
  tanggalPresentasi: Dayjs | null
  tanggal: Dayjs | null
  tanggalPengajuan: Dayjs | null
  noDokumen: string
  noRevisi: number
  tanggalPermintaanPemasangan: Dayjs | null
  tanggalPemasangan: Dayjs | null
  tanggalTraining: Dayjs | null
  catatan: string
  items: FormItem[]
  accesories: FormItem[]
  approvals: ApprovalItem[]
  category?: string // <-- add category field
}

interface RequestFormProps {
  onSubmit?: (data: FormState) => void
  onCancel?: () => void
}

const RequestForm = ({ onSubmit, onCancel }: RequestFormProps) => {
  const [form, setForm] = useState<FormState>({
    namaRS: '',
    alamat: '',
    noTelepon: '',
    alat: '',
    merk: '',
    namaKepalaLab: '',
    serialNumber: '',
    penanggungJawabAlat: '',
    noInvoice: '',
    businessRepresentivePerson: '',
    technicalSupport: '',
    fieldServiceEngineer: '',
    praInstalasi: '',
    pic: '',
    divisi: '',
    onlineOffline: '',
    tanggalPresentasi: null,
    tanggal: null,
    tanggalPengajuan: null,
    noDokumen: '',
    noRevisi: 0,
    tanggalPermintaanPemasangan: null,
    tanggalPemasangan: null,
    tanggalTraining: null,
    catatan: '',
    items: [],
    accesories: [],
    approvals: [],
    category: '', // <-- initialize category
  })

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: keyof FormItem, value: string | number) => {
    const newItems = [...form.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setForm(prev => ({ ...prev, items: newItems }))
  }

  const handleAccessoryChange = (index: number, field: keyof FormItem, value: string | number) => {
    const newAccessories = [...form.accesories]
    newAccessories[index] = { ...newAccessories[index], [field]: value }
    setForm(prev => ({ ...prev, accesories: newAccessories }))
  }

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: '', namaItem: '', jumlah: 0, satuan: '', status: '' }]
    }))
  }

  const removeItem = (index: number) => {
    const newItems = [...form.items]
    newItems.splice(index, 1)
    setForm(prev => ({ ...prev, items: newItems }))
  }

  const addAccessory = () => {
    setForm(prev => ({
      ...prev,
      accesories: [...prev.accesories, { id: '', namaItem: '', jumlah: 0, satuan: '', status: '' }]
    }))
  }

  const removeAccessory = (index: number) => {
    const newAccessories = [...form.accesories]
    newAccessories.splice(index, 1)
    setForm(prev => ({ ...prev, accesories: newAccessories }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(form)
    }
  }
  const textFields: { field: keyof FormState; label: string }[] = [
    { field: 'namaRS', label: 'Nama RS/Lab' },
    { field: 'alamat', label: 'Alamat' },
    { field: 'noTelepon', label: 'No. Telepon' },
    { field: 'alat', label: 'Nama Alat' },
    { field: 'merk', label: 'Merk Alat' },
    { field: 'namaKepalaLab', label: 'Nama Kepala Lab' },
    { field: 'serialNumber', label: 'Serial Number' },
    { field: 'penanggungJawabAlat', label: 'Penanggung Jawab Alat' },
    { field: 'noInvoice', label: 'No. Invoice' },
    { field: 'businessRepresentivePerson', label: 'Business Representative' },
    { field: 'technicalSupport', label: 'Technical Support' },
    { field: 'fieldServiceEngineer', label: 'Field Service Engineer' },
    { field: 'praInstalasi', label: 'Pra Instalasi' },
    { field: 'pic', label: 'PIC' },
    { field: 'divisi', label: 'Divisi' },
    { field: 'onlineOffline', label: 'Online/Offline' },
    { field: 'noDokumen', label: 'No. Dokumen' },
    { field: 'noRevisi', label: 'No. Revisi' },
    { field: 'catatan', label: 'Catatan' }
  ]  

  const dateFields: { field: keyof FormState; label: string }[] = [
    { field: 'tanggalPresentasi', label: 'Tanggal Presentasi' },
    { field: 'tanggal', label: 'Tanggal Dokumen' },
    { field: 'tanggalPengajuan', label: 'Tanggal Pengajuan' },
    { field: 'tanggalPermintaanPemasangan', label: 'Tanggal Permintaan Pemasangan' },
    { field: 'tanggalPemasangan', label: 'Tanggal Pemasangan' },
    { field: 'tanggalTraining', label: 'Tanggal Training' }
  ]

  const categoryOptions = [
    'Instalasi / Uji Fungsi Alat',
    'Training / Presentasi',
    'Sample',
    'Uji Coba / Trial Reagent & Consumable',
  ]

  return (
    <Card>
      <CardHeader title="Form Permintaan Instalasi/Uji Fungsi" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            {/* Category Dropdown */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Kategori Permintaan"
                value={form.category || ''}
                onChange={e => handleChange('category', e.target.value)}
                SelectProps={{ native: false }}
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Only show the rest of the form if a category is selected */}
            {form.category && (
              <>
                {form.category === 'Instalasi / Uji Fungsi Alat' ? (
                  <>
                    {textFields.map(({ field, label }) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                          fullWidth
                          label={label}
                          value={(form as any)[field]}
                          onChange={e => handleChange(field, e.target.value)}
                        />
                      </Grid>
                    ))}

                    {dateFields.map(({ field, label }) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <DatePicker
                          label={label}
                          value={form[field] as Dayjs | null}
                          onChange={date => handleChange(field, date)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    ))}

                    {/* Items Section */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Items</Typography>
                        <Button variant="outlined" onClick={addItem} startIcon={<Icon icon="tabler:plus" />}>
                          Add Item
                        </Button>
                      </Box>
                      {form.items.map((item, index) => (
                        <Grid container spacing={2} key={index}>
                          <Grid item xs={3}>
                            <TextField
                              label="Nama Item"
                              value={item.namaItem}
                              onChange={e => handleItemChange(index, 'namaItem', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              label="Jumlah"
                              type="number"
                              value={item.jumlah}
                              onChange={e => handleItemChange(index, 'jumlah', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              label="Satuan"
                              value={item.satuan}
                              onChange={e => handleItemChange(index, 'satuan', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              label="Status"
                              value={item.status}
                              onChange={e => handleItemChange(index, 'status', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2} display="flex" alignItems="center">
                            <IconButton onClick={() => removeItem(index)} color="error">
                              <Icon icon="tabler:trash" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Accessories Section */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Accessories</Typography>
                        <Button variant="outlined" onClick={addAccessory} startIcon={<Icon icon="tabler:plus" />}>
                          Add Accessory
                        </Button>
                      </Box>
                      {form.accesories.map((item, index) => (
                        <Grid container spacing={2} key={index}>
                          <Grid item xs={3}>
                            <TextField
                              label="Nama Item"
                              value={item.namaItem}
                              onChange={e => handleAccessoryChange(index, 'namaItem', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              label="Jumlah"
                              type="number"
                              value={item.jumlah}
                              onChange={e => handleAccessoryChange(index, 'jumlah', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              label="Satuan"
                              value={item.satuan}
                              onChange={e => handleAccessoryChange(index, 'satuan', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              label="Status"
                              value={item.status}
                              onChange={e => handleAccessoryChange(index, 'status', e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2} display="flex" alignItems="center">
                            <IconButton onClick={() => removeAccessory(index)} color="error">
                              <Icon icon="tabler:trash" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" type="button" onClick={onCancel}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" startIcon={<Icon icon="tabler:send" />}>
                          Submit
                        </Button>
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary">
                      Form for this category is not available yet.
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}
export type { FormState }

export default RequestForm
