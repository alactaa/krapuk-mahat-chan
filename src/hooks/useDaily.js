import { useEffect } from 'react'
import { api } from '../lib/api'

const checkedToday = new Set()

export function useDaily(kidId, onAdded) {
  useEffect(() => {
    if (!kidId) return
    const key = `${kidId}_${new Date().toISOString().slice(0, 10)}`
    if (checkedToday.has(key)) return
    checkedToday.add(key)
    api.checkDaily(kidId)
      .then((res) => {
        if (res.added) onAdded?.(res.amount)
      })
      .catch(() => { checkedToday.delete(key) })
  }, [kidId])
}
