import { proxy, useSnapshot, ref } from 'valtio'
import * as THREE from 'three'

/**
 * @typedef {import('./utils/blendShapes').BlendShapes} BlendShapes
 * @typedef {(blendShapes: BlendShapes, headOrientation: THREE.Quaternion) => void} FacetrackingCallback
 */

class State {
  // DATA
  trackingStarted = false
  needsCalibration = true
  calibrationOrientation = ref(new THREE.Quaternion())
  subscribers = ref(/** @type {Set<FacetrackingCallback>} */ (new Set()))

  // ACTIONS
  /**
   *
   * @param {FacetrackingCallback} fn
   * @returns
   */
  register(fn) {
    this.subscribers.add(fn)
    const unregister = () => this.subscribers.delete(fn)
    return unregister
  }
  calibrate() {
    this.needsCalibrate = true
  }
}

export const store = proxy(new State())

export const useStore = () => useSnapshot(store)
