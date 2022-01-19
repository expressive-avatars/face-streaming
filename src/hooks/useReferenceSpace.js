import { suspend } from 'suspend-react'
import { useXRSession } from './useXRSession'

export function useReferenceSpace(referenceSpaceType) {
  const session = useXRSession()
  const referenceSpace = suspend(
    async (session) => {
      if (session) {
        return await session.requestReferenceSpace(referenceSpaceType)
      } else {
        return null
      }
    },
    [session]
  )
  return referenceSpace
}
