import { useContext, useEffect } from 'react'
import { FacetrackingContext } from '@/context/FacetrackingContext'

/**
 *
 * @param {import('@/context/FacetrackingContext').FacetrackingCallback} fn
 */
export function useFacetracking(fn) {
  const { register } = useContext(FacetrackingContext)
  useEffect(() => {
    const unregister = register(fn)
    return unregister
  }, [fn])
}
