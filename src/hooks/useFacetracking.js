import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useXRFrame } from '@react-three/xr'
import { useXRSession } from '@/hooks/useXRSession'
import * as THREE from 'three'

/**
 * @typedef {{[blendShape: string]: number}} BlendShapes
 * @param {(blendShapes: BlendShapes, transform: THREE.Matrix4) => void} fn
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
        if (worldMesh.changed) {
          fn(worldMesh.blendShapes, worldMesh.modelMatrix)
        }
      })
    }
  })
}
