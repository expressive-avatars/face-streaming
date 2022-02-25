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

/**
 *
 * @param {BlendShapes} blendShapes
 * @param {{ neutral: Partial<BlendShapes>}}
 */
export function applyBlendShapesCalibration(blendShapes, { neutral }) {
  for (let name in neutral) {
    if (blendShapesToCalibrate.has(name)) {
      blendShapes[name] += neutral[name] ?? 0
    }
  }
}

/**
 * Target for "positive" mood slider
 * @type {Partial<BlendShapes>}
 */
const positiveBias = {
  mouthSmileLeft: 0.3,
  mouthSmileRight: 0.3,
  browInnerUp: 0.25,
  eyeBlinkLeft: 0.1,
  eyeBlinkRight: 0.1,
  mouthPressLeft: 0.2,
  mouthPressRight: 0.2,
  mouthShrugLower: 0.17,
  mouthShrugUpper: 0.15,
  noseSneerLeft: 0.15,
  noseSneerRight: 0.15,
  mouthDimpleLeft: 0.1,
  mouthDimpleRight: 0.1,
  mouthStretchLeft: 0.1,
  mouthStretchRight: 0.1,
  cheekSquintLeft: 0.1,
  cheekSquintLeft: 0.1,
  mouthLowerDownLeft: 0.07,
  mouthLowerDownRight: 0.07,
  mouthUpperUpLeft: 0.05,
  mouthUpperUpRight: 0.05,
}

/**
 * Target for "negative" mood slider
 * @type {Partial<BlendShapes>}
 */
const negativeBias = {
  mouthFrownLeft: 0.6,
  mouthFrownRight: 0.6,
  browInnerUp: 0.5,
}

/** @type {Partial<BlendShapes>} */
const scaling = {
  mouthSmileLeft: 0.6,
  mouthSmileRight: 0.6,
}

/**
 * @typedef {typeof blendShapeNames[number]} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 */

export const blendShapeNames = /** @type {const} */ ([
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
  'cheekPuff',
  'cheekSquintLeft',
  'cheekSquintRight',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'eyeLookDownLeft',
  'eyeLookDownRight',
  'eyeLookInLeft',
  'eyeLookInRight',
  'eyeLookOutLeft',
  'eyeLookOutRight',
  'eyeLookUpLeft',
  'eyeLookUpRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'eyeWideLeft',
  'eyeWideRight',
  'jawForward',
  'jawLeft',
  'jawOpen',
  'jawRight',
  'mouthClose',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'mouthFunnel',
  'mouthLeft',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthPucker',
  'mouthRight',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthShrugLower',
  'mouthShrugUpper',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'noseSneerLeft',
  'noseSneerRight',
])

const blendShapesToCalibrate = new Set(blendShapeNames.filter((name) => !name.includes('eye')))

/** @type {(name: BlendShapeName) => BlendShapeName} */
const doMirror = (name) => {
  if (name.includes('Right')) {
    return name.replace('Right', 'Left')
  } else {
    return name.replace('Left', 'Right')
  }
}

/**
 * Maps e.g. "mouthSmileRight" -> "mouthSmileLeft"
 * because WebXRViewer reads mirrored blendShape values
 */
const mirrorMap = Object.fromEntries(blendShapeNames.map((name) => [name, doMirror(name)]))

/** @type {BlendShapes} */
export const initialBlendShapes = Object.fromEntries(blendShapeNames.map((name) => [name, 0]))
