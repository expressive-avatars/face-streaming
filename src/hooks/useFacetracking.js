import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useXRFrame } from '@react-three/xr'
import { useXRSession } from '@/hooks/useXRSession'

/**
 * @typedef {{[blendShape: string]: number}} BlendShapes
 * @param {(blendShapes: BlendShapes) => void} fn - Will be called with each detected blendShapes
 */
export function useFacetracking(fn) {
  const { gl } = useThree()
  const session = useXRSession(gl)
  useEffect(() => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: true,
        },
      })
    }
  }, [session])
  useXRFrame((time, frame) => {
    const worldInfo = frame.worldInformation
    if (worldInfo.meshes) {
      worldInfo.meshes.forEach((worldMesh) => {
        if (worldMesh._blendShapesChanged) {
          fn(worldMesh.blendShapes)
        }
      })
    }
  })
}
