import { useState, useEffect } from 'react'
import { approvalChainService, ApprovalChain } from 'src/services/approvalChainService'
import { UserData } from 'src/types/user'

export const useApprovalChain = (userId: string) => {
  const [chain, setChain] = useState<ApprovalChain[]>([])
  const [nextApprover, setNextApprover] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChain = async () => {
    try {
      setLoading(true)
      const [chainData, nextApproverData] = await Promise.all([
        approvalChainService.getApprovalChain(userId),
        approvalChainService.getNextApprover(userId)
      ])
      setChain(chainData)
      setNextApprover(nextApproverData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approval chain')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchChain()
    }
  }, [userId])

  return { chain, nextApprover, loading, error, refreshChain: fetchChain }
} 