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
          fn(remapBlendShapes(worldMesh.blendShapes), worldMesh.modelMatrix)
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
 * @param {{[name: string]: number}} blendShapes
 */
function remapBlendShapes(blendShapes) {
  return Object.fromEntries(Object.keys(blendShapes).map((name) => [name, blendShapes[mirrorMap[name]]]))
}
