export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalStep {
  role: string
  order: number
  status: ApprovalStatus
  approvedBy?: string
  approvedAt?: Date
  comments?: string
}

export interface ProductOffer {
  id: string
  guid: string
  name: string
  description: string
  price: number
  category: string
  submittedBy: string
  submittedAt: Date
  status: ApprovalStatus
  currentApprovalStep: number
  approvalSteps: ApprovalStep[]
  createdAt: Date
  updatedAt: Date
} 