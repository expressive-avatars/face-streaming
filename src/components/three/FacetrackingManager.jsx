import { useEffect, useState } from 'react'
import { useXRFrame } from '@react-three/xr'
import * as THREE from 'three'

import { useXRSession } from '@/hooks/useXRSession'
import { useReferenceSpace } from '@/hooks/useReferenceSpace'
import { store, useStore } from '@/store'
import { initialBlendShapes, remapBlendShapes } from '@/utils/blendShapes'

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()
const euler = new THREE.Euler()
const eyeEuler = new THREE.Euler()

export function FacetrackingManager() {
  const [[headOrientation, eyeOrientation]] = useState(() => [new THREE.Quaternion(), new THREE.Quaternion()])

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
    eyeOrientation.identity()
    store.subscribers.forEach((callbackFn) => {
      callbackFn({
        blendShapes: initialBlendShapes,
        headOrientation,
        eyeOrientation,
      })
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
          const blendShapes = remapBlendShapes(worldMesh.blendShapes)

          // Orient head using tracker result in local (physical) space
          localHeadMatrix.fromArray(worldMesh.modelMatrix)
          headOrientation.setFromRotationMatrix(localHeadMatrix)

          // Re-orient result to viewer's space
          const localToViewPose = frame.getPose(viewerReferenceSpace, localReferenceSpace)
          const q = localToViewPose.transform.orientation
          viewerOrientation.set(q.x, q.y, q.z, q.w)
          headOrientation.premultiply(viewerOrientation)

          // Un-mirror head orientation (another WebXR Viewer quirk?)
          euler.setFromQuaternion(headOrientation)
          euler.y = -euler.y
          euler.z = -euler.z
          headOrientation.setFromEuler(euler)

          // Convert eye shapes to orientation
          const eyeLookLeft = (blendShapes.eyeLookOutLeft + blendShapes.eyeLookInRight) / 2
          const eyeLookRight = (blendShapes.eyeLookOutRight + blendShapes.eyeLookInLeft) / 2
          const eyeLookUp = (blendShapes.eyeLookUpLeft + blendShapes.eyeLookUpRight) / 2
          const eyeLookDown = (blendShapes.eyeLookDownLeft + blendShapes.eyeLookDownRight) / 2

          eyeEuler.y = eyeLookLeft - eyeLookRight
          eyeEuler.x = eyeLookDown - eyeLookUp
          eyeEuler.z = 0

          // Calibration
          if (store.needsCalibrate) {
            store.headCalibration.copy(headOrientation).invert()
            store.baseEyeEuler.copy(eyeEuler)
            store.needsCalibrate = false
          }
          headOrientation.premultiply(store.headCalibration)

          // Eyes remap range
          eyeEuler.y -= store.baseEyeEuler.y
          eyeEuler.x -= store.baseEyeEuler.x
          eyeEuler.y =
            eyeEuler.y === store.baseEyeEuler.y ? 0 : (eyeEuler.y / (Math.sign(eyeEuler.y) - store.baseEyeEuler.y)) * Math.sign(eyeEuler.y)
          eyeEuler.x =
            eyeEuler.x === store.baseEyeEuler.x ? 0 : (eyeEuler.x / (Math.sign(eyeEuler.x) - store.baseEyeEuler.x)) * Math.sign(eyeEuler.x)

          eyeOrientation.setFromEuler(eyeEuler)

          store.subscribers.forEach((callbackFn) => {
            callbackFn({ blendShapes, headOrientation, eyeOrientation })
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
