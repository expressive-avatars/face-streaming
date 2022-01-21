/**
 * @typedef {keyof mirrorMap} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 */

/**
 * @param {BlendShapes} blendShapes
 * @returns {BlendShapes}
 */
export function remapBlendShapes(blendShapes) {
  return Object.fromEntries(
    Object.keys(mirrorMap).map((name) => {
      const mirroredName = mirrorMap[name]
      let influence = blendShapes[mirroredName] ?? 0
      influence *= scaling[mirroredName] ?? 1
      return [name, influence]
    })
  )
}

const scaling = {
  mouthSmileLeft: 0.6,
  mouthSmileRight: 0.6,
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
