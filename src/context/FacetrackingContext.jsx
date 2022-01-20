import React, { useRef, useState } from 'react'
import { useXRFrame } from '@react-three/xr'
import * as THREE from 'three'

import { useXRSession } from '@/hooks/useXRSession'
import { useReferenceSpace } from '@/hooks/useReferenceSpace'

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()
const euler = new THREE.Euler()

export const FacetrackingContext = React.createContext()

/**
 * @typedef {keyof mirrorMap} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 * @typedef {(blendShapes: BlendShapes, headOrientation: THREE.Quaternion) => void} FacetrackingCallback
 */

/**
 * To be placed in an <ARCanvas /> and globally manage facetracking
 */
export function FacetrackingProvider({ children }) {
  /** @type {React.RefObject<Set<FacetrackingCallback>>} */
  const subscribers = useRef(new Set())
  const needsCalibrate = useRef(false)
  const [[headOrientation, calibrationOrientation]] = useState(() => [new THREE.Quaternion(), new THREE.Quaternion()])
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
          if (needsCalibrate.current) {
            calibrationOrientation.copy(headOrientation).invert()
            needsCalibrate.current = false
          }
          headOrientation.premultiply(calibrationOrientation)

          subscribers.current.forEach((callbackFn) => {
            callbackFn(blendShapes, headOrientation)
          })
        }
      })
    }
  })

  const context = {
    register: (fn) => {
      subscribers.current.add(fn)
      const unregister = () => subscribers.current.delete(fn)
      return unregister
    },
    calibrate: () => {
      needsCalibrate.current = true
    },
  }

  return <FacetrackingContext.Provider children={children} value={context} />
}

const mirrorMap = {
  browDownLeft: 'browDownRight',
  browDownRight: 'browDownLeft',
  browInnerUp: 'browInnerUp',
  browOuterUpLeft: 'browOuterUpRight',
  browOuterUpRight: 'browOuterUpLeft',
  cheekPuff: 'cheekPuff',
  cheekSquintLeft: 'cheekSquintRight',
  cheekSquintRight: 'cheekSquintLeft',
  eyeBlinkLeft: 'eyeBlinkRight',
  eyeBlinkRight: 'eyeBlinkLeft',
  eyeLookDownLeft: 'eyeLookDownRight',
  eyeLookDownRight: 'eyeLookDownLeft',
  eyeLookInLeft: 'eyeLookInRight',
  eyeLookInRight: 'eyeLookInLeft',
  eyeLookOutLeft: 'eyeLookOutRight',
  eyeLookOutRight: 'eyeLookOutLeft',
  eyeLookUpLeft: 'eyeLookUpRight',
  eyeLookUpRight: 'eyeLookUpLeft',
  eyeSquintLeft: 'eyeSquintRight',
  eyeSquintRight: 'eyeSquintLeft',
  eyeWideLeft: 'eyeWideRight',
  eyeWideRight: 'eyeWideLeft',
  jawForward: 'jawForward',
  jawLeft: 'jawRight',
  jawOpen: 'jawOpen',
  jawRight: 'jawLeft',
  mouthClose: 'mouthClose',
  mouthDimpleLeft: 'mouthDimpleRight',
  mouthDimpleRight: 'mouthDimpleLeft',
  mouthFrownLeft: 'mouthFrownRight',
  mouthFrownRight: 'mouthFrownLeft',
  mouthFunnel: 'mouthFunnel',
  mouthLeft: 'mouthRight',
  mouthLowerDownLeft: 'mouthLowerDownRight',
  mouthLowerDownRight: 'mouthLowerDownLeft',
  mouthPressLeft: 'mouthPressRight',
  mouthPressRight: 'mouthPressLeft',
  mouthPucker: 'mouthPucker',
  mouthRight: 'mouthLeft',
  mouthRollLower: 'mouthRollLower',
  mouthRollUpper: 'mouthRollUpper',
  mouthShrugLower: 'mouthShrugLower',
  mouthShrugUpper: 'mouthShrugUpper',
  mouthSmileLeft: 'mouthSmileRight',
  mouthSmileRight: 'mouthSmileLeft',
  mouthStretchLeft: 'mouthStretchRight',
  mouthStretchRight: 'mouthStretchLeft',
  mouthUpperUpLeft: 'mouthUpperUpRight',
  mouthUpperUpRight: 'mouthUpperUpLeft',
  noseSneerLeft: 'noseSneerRight',
  noseSneerRight: 'noseSneerLeft',
}

/**
 * @param {BlendShapes} blendShapes
 * @returns {BlendShapes}
 */
function remapBlendShapes(blendShapes) {
  return Object.fromEntries(Object.keys(mirrorMap).map((name) => [name, blendShapes[mirrorMap[name]] ?? 0]))
}
