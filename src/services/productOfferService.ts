import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from 'src/configs/firebase'
import { ProductOffer, CreateProductOfferData, ApprovalStatus, ApprovalStep } from 'src/types/productOffer'
import { generateGUID } from 'src/utils/guid'

class ProductOfferService {
  private collection = 'productOffers'

  async createOffer(data: CreateProductOfferData): Promise<ProductOffer> {
    const guid = generateGUID()
    const id = doc(collection(db, this.collection)).id
    
    const approvalSteps: ApprovalStep[] = [
      {
        id: generateGUID(),
        role: 'supervisor',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: generateGUID(),
        role: 'manager',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: generateGUID(),
        role: 'director',
        status: 'pending',
        timestamp: new Date()
      }
    ]

    const offer: ProductOffer = {
      ...data,
      id,
      guid,
      status: 'pending',
      approvalSteps,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(doc(db, this.collection, id), {
      ...offer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return offer
  }

  async getOffer(id: string): Promise<ProductOffer | null> {
    const docRef = doc(db, this.collection, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return docSnap.data() as ProductOffer
  }

  async getOffersBySubmitter(submitterId: string): Promise<ProductOffer[]> {
    const q = query(
      collection(db, this.collection),
      where('submitterId', '==', submitterId)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ProductOffer)
  }

  async getPendingApprovals(role: string): Promise<ProductOffer[]> {
    const q = query(
      collection(db, this.collection),
      where('status', '==', 'pending'),
      where('approvalSteps', 'array-contains', { role, status: 'pending' })
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as ProductOffer)
  }

  async updateApprovalStep(
    offerId: string, 
    stepId: string, 
    status: ApprovalStatus, 
    approverName: string,
    comment?: string
  ): Promise<void> {
    const offer = await this.getOffer(offerId)
    if (!offer) throw new Error('Offer not found')

    const updatedSteps = offer.approvalSteps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          status,
          approverName,
          comment,
          timestamp: new Date()
        }
      }
      return step
    })

    // Update overall status based on approval chain
    let overallStatus: ApprovalStatus = 'pending'
    
    if (updatedSteps.every(step => step.status === 'approved')) {
      overallStatus = 'approved'
    } else if (updatedSteps.some(step => step.status === 'rejected')) {
      overallStatus = 'rejected'
    }

    await updateDoc(doc(db, this.collection, offerId), {
      approvalSteps: updatedSteps,
      status: overallStatus,
      updatedAt: serverTimestamp()
    })
  }

  async updateOffer(id: string, data: Partial<ProductOffer>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(doc(db, this.collection, id), updateData)
  }

  async deleteOffer(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, id))
  }
}

export const productOfferService = new ProductOfferService() 