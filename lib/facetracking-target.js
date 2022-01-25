import io from 'socket.io-client'

AFRAME.registerComponent('facetracking-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    const networkedEl = this.el.closest('[networked-avatar]')
    const modelEl = this.el.closest('[gltf-model-plus]')
    this.timeout = null

    modelEl.addEventListener(
      'model-loaded',
      () => {
        this.el.sceneEl.emit('facetracking_ready')
      },
      { once: true }
    )

    // Setup socket
    const isPrimary = networkedEl === document.querySelector('#avatar-rig')
    this.socket = io(`${import.meta.env.VITE_BACKEND}/consumer`, {
      query: {
        type: isPrimary ? 'primary' : 'peer',
        token: isPrimary ? APP.store.state.credentials.token : undefined,
        networkId: NAF.utils.getNetworkId(networkedEl),
      },
    })

    const emitHubInfo = () => {
      this.socket.emit('state', {
        hubName: APP.hub.name,
        avatarURL: modelEl.getAttribute('gltf-model-plus').src,
      })
    }

    this.el.sceneEl.addEventListener('hub_updated', () => emitHubInfo())
    emitHubInfo()

    // Keep state and actions in sync with iOS
    this.el.sceneEl.addEventListener('facetracking_setstate', (e) => {
      this.socket.emit('state', e.detail)
    })
    this.socket.on('state', (stateUpdate) => this.el.sceneEl.emit('facetracking_getstate', stateUpdate))
    this.el.sceneEl.addEventListener('facetracking_action', (e) => {
      this.socket.emit('action', e.detail)
    })

    let trackingStarted = false

    // Send hub/avatar status when iOS device joins
    this.socket.on('provider_join', () => {
      console.log('provider joined')
      trackingStarted = false
      emitHubInfo()
    })

    /** @type {Record<'left'|'right', THREE.Bone>} */
    this.eyes = {
      left: this.el.object3D.getObjectByName('LeftEye'),
      right: this.el.object3D.getObjectByName('RightEye'),
    }
    this.eyes.left.matrixAutoUpdate = true
    this.eyes.right.matrixAutoUpdate = true

    this.skinnedMeshes = []
    this.el.object3D.traverse((obj) => {
      if (obj.isSkinnedMesh && obj.morphTargetInfluences?.length > 0) {
        this.skinnedMeshes.push(obj)
      }
    })

    const onFace = ({ blendShapes, headOrientation }) => {
      if (blendShapes && headOrientation) {
        if (!trackingStarted) {
          this.el.sceneEl.emit('facetracking_start')
          trackingStarted = true
        }

        // Debugging
        window.blendShapes = blendShapes

        for (let blendShape in blendShapes) {
          for (let skinnedMesh of this.skinnedMeshes) {
            skinnedMesh.morphTargetInfluences[skinnedMesh.morphTargetDictionary[blendShape]] = blendShapes[blendShape]
          }

          // Eye rotation
          // Note: base eye rotation is (-Math.PI/2, 0, Math.PI)
          this.eyes.right.rotation.set(
            -Math.PI / 2 + blendShapes['eyeLookDownRight'] * 0.5 - blendShapes['eyeLookUpRight'] * 0.5,
            0,
            Math.PI - blendShapes['eyeLookOutRight'] + blendShapes['eyeLookOutLeft']
          )
          this.eyes.left.rotation.copy(this.eyes.right.rotation)
        }

        this.headQuaternion?.fromArray(headOrientation)
      }
    }
    this.socket.on('face', onFace)
  },
  tick: function () {
    /**
     * Polling since ik-controller may not be present in init
     * @type {THREE.Quaternion}
     */
    this.headQuaternion = this.headQuaternion ?? this.el.components['ik-controller'].headQuaternion

    // Disable idle eye animation
    if (this.el.parentEl.components['loop-animation']) {
      this.el.parentEl.removeAttribute('loop-animation')
    }
  },
  reset: function () {
    this.headQuaternion?.identity()
    for (let skinnedMesh of this.skinnedMeshes) {
      for (let i = 0; i < skinnedMesh.morphTargetInfluences.length; ++i) {
        skinnedMesh.morphTargetInfluences[i] = 0
      }
    }
  },
  remove: function () {
    // Cleanup component
    this.socket.disconnect()
  },
})