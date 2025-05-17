export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStep {
  id: string;
  role: string;
  status: ApprovalStatus;
  comment?: string;
  approverName?: string;
  timestamp: Date;
}

export interface ProductOffer {
  id: string;
  guid: string;
  name: string;
  description: string;
  price: number;
  category: string;
  submitterId: string;
  submitterName: string;
  status: ApprovalStatus;
  approvalSteps: ApprovalStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductOfferData extends Omit<ProductOffer, 'id' | 'guid' | 'status' | 'approvalSteps' | 'createdAt' | 'updatedAt'> {} 