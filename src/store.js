import { proxy, useSnapshot, ref } from 'valtio'
import * as THREE from 'three'
import io from 'socket.io-client'

import { getCookie } from '@/utils/getCookie'

/**
 *
 * @returns {?{email: ?string, token: ?string}}
 */
function getCredentials() {
  if (import.meta.env.MODE === 'development') {
    return {
      email: import.meta.env.EMAIL,
      token: import.meta.env.TOKEN,
    }
  }
  try {
    const cookieData = getCookie('credentials')
    return JSON.parse(cookieData)
  } catch (e) {
    return null
  }
}

/**
 * @typedef {import('./utils/blendShapes').BlendShapes} BlendShapes
 * @typedef {{ blendShapes: BlendShapes, headOrientation: THREE.Quaternion, eyeOrientation: THREE.Quaternion }} FacetrackingPayload
 * @typedef {(payload: FacetrackingPayload) => void} FacetrackingCallback
 */

class State {
  // DATA
  trackingStarted = false
  needsCalibration = true
  paused = false
  previewHidden = false
  hubName = null
  avatarURL = null

  // Reference orientations for calibration
  headCalibration = ref(new THREE.Quaternion())
  baseEyeEuler = ref(new THREE.Euler())

  subscribers = ref(/** @type {Set<FacetrackingCallback>} */ (new Set()))
  credentials = getCredentials()
  socket = null

  // ACTIONS
  initSocket() {
    const socket = io(import.meta.env.VITE_BACKEND + '/provider', {
      query: { token: this.credentials.token },
    })

    socket.on('state', (partial) => {
      console.log('state', partial)
      Object.assign(this, partial)
    })
    socket.on('action', (type) => {
      switch (type) {
        case 'calibrate':
          store.calibrate()
          break
      }
    })

    this.socket = ref(socket)
    return this.socket
  }
  /** @param {FacetrackingCallback} fn */
  register(fn) {
    this.subscribers.add(fn)
    const unregister = () => this.subscribers.delete(fn)
    return unregister
  }
  calibrate() {
    this.needsCalibrate = true
  }
  togglePause() {
    this.paused = !this.paused
  }
}

export const store = proxy(new State())

export const useStore = () => useSnapshot(store)
