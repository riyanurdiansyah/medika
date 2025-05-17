import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import toast from 'react-hot-toast'

// Define the approval levels in order
const approvalLevels = [
  { level: 1, role: 'sales', title: 'Sales' },
  { level: 2, role: 'supervisor', title: 'Supervisor' },
  { level: 3, role: 'manager', title: 'Manager' },
  { level: 4, role: 'deputy-manager', title: 'Deputy Manager' }
]

const ApprovalSettings = () => {
  const [loading, setLoading] = useState(false)

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const newLevels = [...approvalLevels]
    const temp = newLevels[index - 1].level
    newLevels[index - 1].level = newLevels[index].level
    newLevels[index].level = temp
    updateApprovalLevels(newLevels)
  }

  const handleMoveDown = (index: number) => {
    if (index >= approvalLevels.length - 1) return
    const newLevels = [...approvalLevels]
    const temp = newLevels[index + 1].level
    newLevels[index + 1].level = newLevels[index].level
    newLevels[index].level = temp
    updateApprovalLevels(newLevels)
  }

  const updateApprovalLevels = async (levels: typeof approvalLevels) => {
    try {
      setLoading(true)
      const approvalSettingsRef = doc(db, 'settings', 'approvalFlow')
      await setDoc(approvalSettingsRef, {
        levels: levels.sort((a, b) => a.level - b.level),
        updatedAt: new Date()
      })
      toast.success('Approval flow updated successfully')
    } catch (error) {
      console.error('Error updating approval flow:', error)
      toast.error('Failed to update approval flow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader 
        title='Approval Flow Settings' 
        subheader='Configure the order of approval levels for sales requests'
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvalLevels.map((level, index) => (
                <TableRow key={level.role}>
                  <TableCell>{level.level}</TableCell>
                  <TableCell>{level.title}</TableCell>
                  <TableCell align='right'>
                    <IconButton 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || loading}
                    >
                      <Icon icon='mdi:arrow-up' />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === approvalLevels.length - 1 || loading}
                    >
                      <Icon icon='mdi:arrow-down' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            onClick={() => updateApprovalLevels(approvalLevels)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

// Add ACL configuration
ApprovalSettings.acl = {
  action: 'manage',
  subject: 'Super Admin'
}

export default ApprovalSettings 