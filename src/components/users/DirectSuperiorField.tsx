import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useUsers } from 'src/hooks/useUsers'
import { useApprovalLevels } from 'src/hooks/useApprovalLevels'
import { UserData } from 'src/types/user'

interface DirectSuperiorFieldProps {
  currentUser: UserData
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const DirectSuperiorField = ({ currentUser, value, onChange, disabled }: DirectSuperiorFieldProps) => {
  const { users } = useUsers()
  const { getHigherLevelRoles } = useApprovalLevels()

  // Get eligible superiors based on user's role
  const getEligibleSuperiors = () => {
    if (currentUser.role === 'sales') {
      const higherRoles = getHigherLevelRoles('sales')
      return users.filter(user => 
        higherRoles.includes(user.role) && 
        user.id !== currentUser.id
      )
    }
    return users.filter(user => user.id !== currentUser.id)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Direct Superior</InputLabel>
      <Select
        value={value || ''}
        label="Direct Superior"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <MenuItem value="">None</MenuItem>
        {getEligibleSuperiors().map(user => (
          <MenuItem key={user.id} value={user.id}>
            {user.fullname} ({user.role})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default DirectSuperiorField 