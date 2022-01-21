import { useState } from 'react'
import { useXRFrame } from '@react-three/xr'
import * as THREE from 'three'

import { useXRSession } from '@/hooks/useXRSession'
import { useReferenceSpace } from '@/hooks/useReferenceSpace'
import { store } from '@/store'
import { remapBlendShapes } from '@/utils/blendShapes'

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()
const euler = new THREE.Euler()

export function FacetrackingManager() {
  const [headOrientation] = useState(() => new THREE.Quaternion())

  useXRSession((session) => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: true,
        },
      })
    }
  })
  const localReferenceSpace = useReferenceSpace('local')
  const viewerReferenceSpace = useReferenceSpace('viewer')

  useXRFrame((time, frame) => {
    const worldInfo = frame.worldInformation
    if (worldInfo.meshes && localReferenceSpace && viewerReferenceSpace) {
      worldInfo.meshes.forEach((worldMesh) => {
        if (worldMesh.changed && worldMesh.blendShapes && worldMesh.modelMatrix) {
          const blendShapes = remapBlendShapes(worldMesh.blendShapes)

          // Orient head using tracker result in local (physical) space
          localHeadMatrix.fromArray(worldMesh.modelMatrix)
          headOrientation.setFromRotationMatrix(localHeadMatrix)

          // Re-orient result to viewer's space
          const localToViewPose = frame.getPose(viewerReferenceSpace, localReferenceSpace)
          const q = localToViewPose.transform.orientation
          viewerOrientation.set(q.x, q.y, q.z, q.w)
          headOrientation.premultiply(viewerOrientation)

          // Un-mirror head orientation
          euler.setFromQuaternion(headOrientation)
          euler.y = -euler.y
          euler.z = -euler.z
          headOrientation.setFromEuler(euler)

          // Calibration
          if (store.needsCalibrate) {
            store.calibrationOrientation.copy(headOrientation).invert()
            store.needsCalibrate = false
          }
          headOrientation.premultiply(store.calibrationOrientation)

          store.subscribers.forEach((callbackFn) => {
            callbackFn(blendShapes, headOrientation)
          })

          if (!store.trackingStarted) {
            store.trackingStarted = true
          }
        }
      })
    }
  })

  return null
}
