import { Timestamp } from 'firebase/firestore'

export type RequestStatus = 'pending' | 'approved_supervisor' | 'approved_manager' | 'approved_deputy' | 'rejected' | 'completed'
export type RequestType = 'goods' | 'training' | 'other'

export interface Request {
  id: string
  title: string
  description: string
  type: RequestType
  requesterId: string
  requesterName: string
  status: RequestStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  currentApprovalLevel: number // 0: pending, 1: supervisor, 2: manager, 3: deputy
  approvalHistory: {
    level: number
    status: 'approved' | 'rejected'
    approverId: string
    approverName: string
    approverRole: string
    comment?: string
    timestamp: Timestamp
  }[]
  attachments?: string[] // URLs to attached files
  estimatedCost?: number
} 