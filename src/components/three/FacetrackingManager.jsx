import { useEffect, useState } from 'react'
import { useXRFrame } from '@react-three/xr'
import * as THREE from 'three'

import { useXRSession } from '@/hooks/useXRSession'
import { useReferenceSpace } from '@/hooks/useReferenceSpace'
import { store, useStore } from '@/store'
import { applyBlendShapesCalibration, initialBlendShapes, remapBlendShapes } from '@/utils/blendShapes'
import { ref } from 'valtio'

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()
const euler = new THREE.Euler()

export function FacetrackingManager({ socket }) {
  const [headOrientation] = useState(() => new THREE.Quaternion())

  const session = useXRSession((session) => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: true,
        },
      })
    }
  })

  const resetFace = () => {
    headOrientation.identity()
    store.subscribers.forEach((callbackFn) => {
      callbackFn(initialBlendShapes, headOrientation)
    })
  }

  const snap = useStore()
  useEffect(() => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: !snap.paused,
        },
      })
    }
    // TODO reset headorientation and blendshapes when paused
    if (snap.paused) {
      resetFace()
    }
  }, [snap.paused])

  const localReferenceSpace = useReferenceSpace('local')
  const viewerReferenceSpace = useReferenceSpace('viewer')

  useXRFrame((time, frame) => {
    const worldInfo = frame.worldInformation
    if (worldInfo.meshes && localReferenceSpace && viewerReferenceSpace) {
      worldInfo.meshes.forEach((worldMesh) => {
        if (worldMesh.changed && worldMesh.blendShapes && worldMesh.modelMatrix) {
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

          if (store.needsCalibrate.center) {
            store.calibrationOrientation.copy(headOrientation).invert()
            store.needsCalibrate.center = false
          }
          headOrientation.premultiply(store.calibrationOrientation)

          let blendShapes = remapBlendShapes(worldMesh.blendShapes)
          if (store.needsCalibrate.neutral) {
            store.calibrationNeutral = ref({ ...blendShapes })
            store.needsCalibrate.neutral = false
          }
          applyBlendShapesCalibration(blendShapes, { neutral: store.calibrationNeutral })

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
