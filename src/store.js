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
 * @typedef {(blendShapes: BlendShapes, headOrientation: THREE.Quaternion) => void} FacetrackingCallback
 */

class State {
  // DATA
  trackingStarted = false
  needsCalibration = true
  paused = false
  mood = 0
  previewHidden = false
  hubName = null
  avatarURL = null
  calibrationOrientation = ref(new THREE.Quaternion())
  subscribers = ref(/** @type {Set<FacetrackingCallback>} */ (new Set()))
  credentials = getCredentials()
  socket = null

  // ACTIONS
  initSocket() {
    const socket = io(import.meta.env.VITE_BACKEND + '/provider', {
      query: { token: this.credentials.token },
    })

    socket.on('state', (partial) => {
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
