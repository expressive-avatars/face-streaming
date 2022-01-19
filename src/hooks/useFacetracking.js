import { useXRFrame } from '@react-three/xr'
import * as THREE from 'three'

import { useXRSession } from '@/hooks/useXRSession'
import { useReferenceSpace } from './useReferenceSpace'
import { useState } from 'react'

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()

/**
 * Note: this corrects for the mirrored morph targets provided by WebXR Viewer
 *
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 * @param {(blendShapes: BlendShapes, headOrientation: THREE.Quaternion) => void} fn
 */
export function useFacetracking(fn) {
  const [[headOrientation, eyeOrientation]] = useState(() => [new THREE.Quaternion(), new THREE.Quaternion()])
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

          fn(blendShapes, headOrientation)
        }
      })
    }
  })
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
 * @typedef {keyof mirrorMap} BlendShapeName
 */

/**
 * @param {BlendShapes} blendShapes
 */
function remapBlendShapes(blendShapes) {
  return Object.fromEntries(Object.keys(blendShapes).map((name) => [name, blendShapes[mirrorMap[name]] ?? 0]))
}
