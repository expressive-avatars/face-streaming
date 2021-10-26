import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useXRFrame } from '@react-three/xr'
import { useXRSession } from '@/hooks/useXRSession'
import * as THREE from 'three'

const mat4 = new THREE.Matrix4()

/**
 * @typedef {{[blendShape: string]: number}} BlendShapes
 * @param {(blendShapes: BlendShapes, transform: THREE.Matrix4) => void} fn
 */
export function useFacetracking(fn) {
  const { gl } = useThree()
  const session = useXRSession(gl)

  // Used for calibrating the resting pose
  const [matrixOffset] = useState(() => new THREE.Matrix4())

  useEffect(() => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: true,
        },
      })
    }
  }, [session])

  const needsCalibrate = useRef(false)
  const calibrate = () => {
    needsCalibrate.current = true
  }

  useXRFrame((time, frame) => {
    const worldInfo = frame.worldInformation
    if (worldInfo.meshes) {
      worldInfo.meshes.forEach((worldMesh) => {
        if (worldMesh.changed) {
          mat4.fromArray(worldMesh.modelMatrix)
          if (needsCalibrate.current) {
            matrixOffset.copy(mat4).invert()
            needsCalibrate.current = false
          }
          mat4.multiply(matrixOffset)
          fn(worldMesh.blendShapes, mat4)
        }
      })
    }
  })

  return calibrate
}
