import { useEffect } from 'react'
import { store } from '@/store'

/**
 *
 * @param {import('@/store').FacetrackingCallback} fn
 */
export function useFacetracking(fn) {
  useEffect(() => {
    const unregister = store.register(fn)
    return unregister
  }, [fn])
}
