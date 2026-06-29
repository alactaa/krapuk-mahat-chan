import { useEffect } from 'react'
import { api } from '../lib/api'

export function useDaily(kidId, onAdded) {
  useEffect(() => {
    if (!kidId) return
    api.checkDaily(kidId)
      .then((res) => {
        if (res.added) {
          onAdded?.(res.amount)
        }
      })
      .catch(() => {})
  }, [kidId])
}
