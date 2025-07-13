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
import { RequestFormM, createRequestFormMFromJson } from 'src/types/requestForm'
import { UserData } from 'src/types/user'
import { generateGUID } from 'src/utils/guid'

export interface CreateRequestData {
  title: string
  description: string
  type: RequestType
  requesterId: string
  requesterName: string
  estimatedCost?: number
  createdBy?: string
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
      // Convert Flutter pattern: where("createdBy", isEqualTo: dC.profile.value?.username)
      // In our Next.js app, we use requesterId instead of createdBy
      const q = query(
        requestsCollection, 
        where('requesterId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const requestsSnapshot = await getDocs(q)
      return this.mapRequestsData(requestsSnapshot)
    } catch (error) {
      console.error('Error fetching requests:', error)
      
      // Fallback to simple query if index is not ready (similar to Flutter error handling)
      try {
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
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
        throw new Error(`Failed to get documents: ${fallbackError}`)
      }
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
        createdBy: data.createdBy || data.requesterName,
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

  async createRequest(data: any): Promise<string> {
    const guid = generateGUID()
    const requestDoc = doc(db, 'requests', guid)
    
    await setDoc(requestDoc, data)

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

    // Get the requester's data to check direct superior
    const requesterDoc = await getDoc(doc(db, 'users', request.requesterId))
    if (!requesterDoc.exists()) throw new Error('Requester not found')
    
    const requesterData = requesterDoc.data()
    
    // Check if the approver is the direct superior
    if (requesterData.directSuperior !== approverId) {
      throw new Error('You are not authorized to approve this request. Only the direct superior can approve.')
    }

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
      case 'usermanager':
        roleForStatus = normalizedRole
        break
      default:
        throw new Error('Invalid approver role')
    }

    // Determine the next status
    let nextStatus: RequestStatus
    if (nextLevel > 3) {
      nextStatus = 'completed'
    } else {
      nextStatus = `approved_${roleForStatus}` as RequestStatus
    }

    const newApprovalEntry: ApprovalHistoryEntry = {
      level: request.currentApprovalLevel,
      status: 'approved',
      approverId,
      approverName,
      approverRole,
      timestamp: Timestamp.now()
    }

    console.log('Updating request with:', {
      status: nextStatus,
      currentApprovalLevel: nextLevel,
      approvalHistory: [...request.approvalHistory, newApprovalEntry]
    })

    const requestDoc = doc(db, 'requests', requestId)
    await updateDoc(requestDoc, {
      status: nextStatus,
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
    debugger;
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

  async getPendingApprovals(approverRole: string, approverId: string): Promise<Request[]> {
    const requestsCollection = collection(db, 'requests')
    let approvalLevel = 1 // Default for Supervisor

    console.log('Getting pending approvals for role:', approverRole)
    console.log('Approver ID:', approverId)

    // Map roles to approval levels
    const normalizedRole = approverRole.toLowerCase().trim()
    console.log('Normalized role:', normalizedRole)

    switch (normalizedRole) {
      case 'supervisor':
        approvalLevel = 1
        break
      case 'manager':
      case 'usermanager':
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
      
      // First get all requests at the current level
      const q = query(
        requestsCollection,
        where('currentApprovalLevel', '==', approvalLevel),
        where('status', '==', previousStatus)
      )

      console.log('Executing query for approval level:', approvalLevel)
      const requestsSnapshot = await getDocs(q)
      const allRequests = this.mapRequestsData(requestsSnapshot)
      console.log('All requests at current level:', allRequests)

      // Filter requests where the current user is the direct superior
      const filteredRequests = []
      for (const request of allRequests) {
        const requesterDoc = await getDoc(doc(db, 'users', request.requesterId))
        if (requesterDoc.exists()) {
          const requesterData = requesterDoc.data()
          console.log('Requester data:', requesterData)
          console.log('Checking if', approverId, 'is direct superior of', request.requesterId)
          if (requesterData.directSuperior === approverId) {
            console.log('Found matching request:', request)
            filteredRequests.push(request)
          }
        }
      }

      console.log('Final filtered requests:', filteredRequests)
      return filteredRequests
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      return []
    }
  },

  async resubmitRequest(requestId: string): Promise<void> {
    const request = await this.getRequestById(requestId)
    if (!request) throw new Error('Request not found')

    if (request.status !== 'rejected') {
      throw new Error('Only rejected requests can be resubmitted')
    }

    const requestDoc = doc(db, 'requests', requestId)
    await updateDoc(requestDoc, {
      status: 'pending' as RequestStatus,
      currentApprovalLevel: 1,
      approvalHistory: [...request.approvalHistory, {
        level: request.currentApprovalLevel,
        status: 'resubmitted' as ApprovalStatus,
        approverId: request.requesterId,
        approverName: request.requesterName,
        approverRole: 'requester',
        comment: 'Request resubmitted by requester',
        timestamp: Timestamp.now()
      }],
      updatedAt: serverTimestamp()
    })
  },

  // Direct conversion of Flutter getRequests() function
  // Flutter: where("createdBy", isEqualTo: dC.profile.value?.username)
  async getRequestsByCreatedBy(username: string): Promise<RequestFormM[]> {
    const requestsCollection = collection(db, 'requests')
    try {
      const q = query(
        requestsCollection, 
        where('createdBy', '==', username),
        orderBy('dtCreated', 'desc')
      )
      const requestsSnapshot = await getDocs(q)
      return requestsSnapshot.docs.map(doc => {
        const data = doc.data()
        return createRequestFormMFromJson({
          id: doc.id,
          ...data
        })
      })
    } catch (error) {
      console.error('Error fetching requests by createdBy:', error)
      
      // Fallback to simple query if index is not ready
      try {
        console.log('Falling back to simple query without ordering')
        const fallbackQuery = query(
          requestsCollection,
          where('createdBy', '==', username)
        )
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const requests = fallbackSnapshot.docs.map(doc => {
          const data = doc.data()
          return createRequestFormMFromJson({
            id: doc.id,
            ...data
          })
        })
        
        // Sort in memory instead
        return requests.sort((a: RequestFormM, b: RequestFormM) => {
          const dateA = a.dtCreated instanceof Timestamp ? a.dtCreated.toMillis() : 0
          const dateB = b.dtCreated instanceof Timestamp ? b.dtCreated.toMillis() : 0
          return dateB - dateA // descending order
        })
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
        throw new Error(`Failed to get documents: ${fallbackError}`)
      }
    }
  },

  async updateRequestForm(data: RequestFormM): Promise<RequestFormM | null> {
    try {
      const requestDoc = doc(db, 'requests', data.id)
      await setDoc(requestDoc, {
        ...data,
        dtUpdated: serverTimestamp()
      }, { merge: true })
      
      return data
    } catch (error) {
      console.error('Error updating request form:', error)
      throw new Error(`Failed to update request form: ${error}`)
    }
  },

  async submitRequest(
    data: RequestFormM,
    type: 'APPROVED' | 'REVISED' | 'REJECTED',
    username: string
  ) {
    try {
      // Recursively remove undefined values
      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) return null
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined).filter(item => item !== null)
        }
        if (typeof obj === 'object') {
          const cleaned: any = {}
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
              cleaned[key] = removeUndefined(value)
            }
          }
          return cleaned
        }
        return obj
      }

      const cleanData = removeUndefined(data) as RequestFormM

      const updatedRequest: RequestFormM = {
        ...cleanData,
        approvals: [
          ...(data.approvals || []),
          {
            nama: username ?? '-',
            tanggal: Timestamp.now(),
            status: type,
            isFinalStatus: type === 'APPROVED',
          },
        ],
        dtUpdated: Timestamp.now(),
      }

      await setDoc(doc(db, 'requests', data.id), updatedRequest)

      return { success: true, message: `Request ${type.toLowerCase()} successfully.` }
    } catch (error: any) {
      return { success: false, message: error.message || 'Something went wrong.' }
    }
  },

  // Flutter-style getRequests function for approvals
  async getRequestsForApprovals(currentUserId: string, users: UserData[]): Promise<RequestFormM[]> {
    try {
      const usernames = users.map((u) => u.username).filter(Boolean) as string[]

      if (usernames.length === 0) {
        return []
      }

      // Get requests where createdBy is in the usernames list
      const requestsCollection = collection(db, 'requests')
      const q = query(
        requestsCollection,
        where('createdBy', 'in', usernames)
      )
      
      const response = await getDocs(q)
      const allRequests = response.docs.map((doc) => {
        const data = doc.data()
        return createRequestFormMFromJson({
          id: doc.id,
          ...data
        })
      })

      // Filter requests based on approval logic
      const filteredRequests = allRequests.filter((request: RequestFormM) => {
        const approvals = request.approvals

        // 1. If approvals is empty → take it
        if (approvals.length === 0) {
          const userRequestor = users.find((x) => x.username === request.createdBy)
          if (!userRequestor) return false
          return userRequestor.directSuperior === currentUserId
        }

        const lastApproval = approvals[approvals.length - 1]

        // 2. If REJECTED → discard
        if (lastApproval.status === 'REJECTED') return false

        // 3. If final status → discard
        if (lastApproval.isFinalStatus) return false

        // 4. Check if directSuperior matches
        const lastUsername = lastApproval.nama
        const user = users.find((u) => u.username === lastUsername)

        if (!user) return false

        return user.directSuperior === currentUserId
      })

      return filteredRequests
    } catch (error) {
      console.error('Failed to get requests for approvals:', error)
      throw new Error(`Failed to get requests for approvals: ${error}`)
    }
  }
}

export { requestService } 