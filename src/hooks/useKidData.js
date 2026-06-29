import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

export function useKidData(kidId) {
  const [kid, setKid] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!kidId) return
    setLoading(true)
    setError(null)
    try {
      const [kidData, txData, goalData] = await Promise.all([
        api.getKid(kidId),
        api.getTransactions(kidId, 30),
        api.getGoals(kidId),
      ])
      setKid(kidData)
      setTransactions(txData)
      setGoals(goalData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [kidId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { kid, transactions, goals, loading, error, refresh }
}
