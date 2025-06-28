import { Card, CardHeader, CardContent, Box, Typography, Avatar, Chip } from '@mui/material'
import { useApprovalChain } from 'src/hooks/useApprovalChain'
import Icon from 'src/@core/components/icon'

interface ApprovalChainProps {
  userId: string
}

const ApprovalChain = ({ userId }: ApprovalChainProps) => {
  const { chain, loading, error } = useApprovalChain(userId)

  if (loading) {
    return <Typography>Loading approval chain...</Typography>
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Card>
      <CardHeader 
        title="Approval Chain"
        subheader="Chain of command for approvals"
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chain.map((item, index) => (
            <Box
              key={item.userId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              {index < chain.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -20,
                    transform: 'translateX(-50%)',
                    color: 'text.secondary'
                  }}
                >
                  <Icon icon="tabler:arrow-down" />
                </Box>
              )}
              <Avatar src={item.user.avatar || undefined}>
                {item.user.fullname.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{item.user.fullname}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.user.email}
                </Typography>
              </Box>
              <Chip
                label={`Level ${item.level}`}
                color="primary"
                size="small"
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ApprovalChain 