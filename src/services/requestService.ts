import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { Request, RequestType, RequestStatus, ApprovalStatus, ApprovalHistoryEntry } from 'src/types/request'
import { generateGUID } from 'src/utils/guid'

export interface CreateRequestData {
  title: string
  description: string
  type: RequestType
  requesterId: string
  requesterName: string
  estimatedCost?: number
}

const requestService = {
  async getAllRequests(): Promise<Request[]> {
    const requestsCollection = collection(db, 'requests')
    const requestsSnapshot = await getDocs(requestsCollection)
    return requestsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        approvalHistory: (data.approvalHistory || []).map((entry: any) => ({
          level: entry.level,
          status: entry.status as ApprovalStatus,
          approverId: entry.approverId,
          approverName: entry.approverName,
          approverRole: entry.approverRole,
          comment: entry.comment,
          timestamp: entry.timestamp || Timestamp.now()
        }))
      } as Request
    })
  },

  async getMyRequests(userId: string): Promise<Request[]> {
    const requestsCollection = collection(db, 'requests')
    try {
      // Try with ordering first
      const q = query(
        requestsCollection, 
        where('requesterId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const requestsSnapshot = await getDocs(q)
      return this.mapRequestsData(requestsSnapshot)
    } catch (error) {
      // Fallback to simple query if index is not ready
      console.log('Falling back to simple query without ordering')
      const fallbackQuery = query(
        requestsCollection,
        where('requesterId', '==', userId)
      )
      const fallbackSnapshot = await getDocs(fallbackQuery)
      const requests = this.mapRequestsData(fallbackSnapshot)
      
      // Sort in memory instead
      return requests.sort((a: Request, b: Request) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0
        return dateB - dateA // descending order
      })
    }
  },

  mapRequestsData(snapshot: any) {
    return snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        approvalHistory: (data.approvalHistory || []).map((entry: any) => ({
          level: entry.level,
          status: entry.status as ApprovalStatus,
          approverId: entry.approverId,
          approverName: entry.approverName,
          approverRole: entry.approverRole,
          comment: entry.comment,
          timestamp: entry.timestamp || Timestamp.now()
        }))
      } as Request
    })
  },

  async getRequestById(requestId: string): Promise<Request | null> {
    const requestDoc = doc(db, 'requests', requestId)
    const requestSnapshot = await getDoc(requestDoc)
    if (!requestSnapshot.exists()) return null
    
    const data = requestSnapshot.data()
    return {
      id: requestSnapshot.id,
      ...data,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
      approvalHistory: (data.approvalHistory || []).map((entry: any) => ({
        level: entry.level,
        status: entry.status as ApprovalStatus,
        approverId: entry.approverId,
        approverName: entry.approverName,
        approverRole: entry.approverRole,
        comment: entry.comment,
        timestamp: entry.timestamp || Timestamp.now()
      }))
    } as Request
  },

  async createRequest(data: CreateRequestData): Promise<string> {
    const guid = generateGUID()
    const requestDoc = doc(db, 'requests', guid)
    
    await setDoc(requestDoc, {
      ...data,
      guid,
      status: 'pending' as RequestStatus,
      currentApprovalLevel: 1,
      approvalHistory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return guid
  },

  async updateRequest(requestId: string, data: Partial<Request>): Promise<void> {
    const requestDoc = doc(db, 'requests', requestId)
    await updateDoc(requestDoc, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  async approveRequest(
    requestId: string,
    approverId: string,
    approverName: string,
    approverRole: string,
  ): Promise<void> {
    const request = await this.getRequestById(requestId)
    if (!request) throw new Error('Request not found')

    const nextLevel = request.currentApprovalLevel + 1
    
    // Normalize the role name to match getPendingApprovals
    const normalizedRole = approverRole.toLowerCase().trim()
    let roleForStatus = normalizedRole
    switch (normalizedRole) {
      case 'deputy manager':
      case 'deputy_manager':
      case 'deputymanager':
        roleForStatus = 'deputy'
        break
      case 'supervisor':
      case 'manager':
        roleForStatus = normalizedRole
        break
      default:
        throw new Error('Invalid approver role')
    }

    const status = nextLevel > 3 ? 'completed' : `approved_${roleForStatus}` as RequestStatus

    const newApprovalEntry: ApprovalHistoryEntry = {
      level: request.currentApprovalLevel,
      status: 'approved',
      approverId,
      approverName,
      approverRole,
      timestamp: Timestamp.now()
    }

    const requestDoc = doc(db, 'requests', requestId)
    await updateDoc(requestDoc, {
      status,
      currentApprovalLevel: nextLevel,
      approvalHistory: [...request.approvalHistory, newApprovalEntry],
      updatedAt: serverTimestamp()
    })
  },

  async rejectRequest(
    requestId: string,
    approverId: string,
    approverName: string,
    approverRole: string,
  ): Promise<void> {
    const request = await this.getRequestById(requestId)
    if (!request) throw new Error('Request not found')

    const newApprovalEntry: ApprovalHistoryEntry = {
      level: request.currentApprovalLevel,
      status: 'rejected',
      approverId,
      approverName,
      approverRole,
      timestamp: Timestamp.now()
    }


    const requestDoc = doc(db, 'requests', requestId)
    console.log('newApprovalEntry', newApprovalEntry)
    await updateDoc(requestDoc, {
      status: 'rejected',
      currentApprovalLevel: request.currentApprovalLevel,
      approvalHistory: [...request.approvalHistory, newApprovalEntry],
      updatedAt: new Date(),
    })
  },

  async getPendingApprovals(approverRole: string): Promise<Request[]> {
    const requestsCollection = collection(db, 'requests')
    let approvalLevel = 1 // Default for Supervisor

    console.log('Getting pending approvals for role:', approverRole)

    // Map roles to approval levels
    const normalizedRole = approverRole.toLowerCase().trim()
    console.log('Normalized role:', normalizedRole)

    switch (normalizedRole) {
      case 'supervisor':
        approvalLevel = 1
        break
      case 'manager':
        approvalLevel = 2
        break
      case 'deputy manager':
      case 'deputy_manager':
      case 'deputymanager':
        approvalLevel = 3
        break
      default:
        console.log('Invalid role for approvals:', approverRole)
        return [] // Return empty array for invalid roles
    }

    console.log('Approval level determined:', approvalLevel)

    try {
      // Get requests that are at the current approval level
      // For level 1 (supervisor), look for 'pending'
      // For other levels, look for approval from previous level
      const previousStatus = approvalLevel === 1 
        ? 'pending'
        : approvalLevel === 2 
          ? 'approved_supervisor'
          : 'approved_manager'

      console.log('Looking for requests with status:', previousStatus)
      
      const q = query(
        requestsCollection,
        where('currentApprovalLevel', '==', approvalLevel),
        where('status', '==', previousStatus)
      )

      console.log('Executing query for approval level:', approvalLevel)
      const requestsSnapshot = await getDocs(q)
      const results = this.mapRequestsData(requestsSnapshot)
      console.log('Query results:', results)

      return results
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      return []
    }
  }
}

export { requestService } 