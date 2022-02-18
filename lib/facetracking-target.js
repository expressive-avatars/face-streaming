import io from 'socket.io-client'
import './aura'

AFRAME.registerComponent('facetracking-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    const networkedEl = this.el.closest('[networked-avatar]')
    const modelEl = this.el.closest('[gltf-model-plus]')

    // Set up aura
    const auraEl = document.createElement('a-entity')
    auraEl.setAttribute('aura', { size: 0, color: 'yellow' })
    this.el.querySelector('.Head').appendChild(auraEl)

    this.trackingStarted = false

    // Setup socket
    const isPrimary = networkedEl === document.querySelector('#avatar-rig')
    this.socket = io(`${import.meta.env.VITE_BACKEND}/consumer`, {
      query: {
        type: isPrimary ? 'primary' : 'peer',
        token: isPrimary ? APP.store.state.credentials.token : undefined,
        networkId: NAF.utils.getNetworkId(networkedEl),
      },
    })

    if (isPrimary) {
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

      // Send hub/avatar status when iOS device joins
      this.socket.on('provider_join', () => {
        console.log('provider joined')
        this.trackingStarted = false
        emitHubInfo()
      })
    }

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

    /** @param {{ blendShapes: import('@/store').BlendShapes, headOrientation: number[] }} */
    const onFace = ({ blendShapes, headOrientation }) => {
      if (blendShapes && headOrientation) {
        if (!this.trackingStarted) {
          isPrimary && this.el.sceneEl.emit('facetracking_start')
          this.trackingStarted = true
          this.stopPrevBehaviors()
        }

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

        // Pick out aura shapes
        const smileAmount = (blendShapes.mouthSmileRight + blendShapes.mouthSmileLeft) / 2
        auraEl.setAttribute('aura', { size: smileAmount })

        this.headQuaternion?.fromArray(headOrientation)
      }
    }
    this.socket.on('face', onFace)

    this.socket.on('provider_disconnect', () => {
      this.reset()
      this.restartPrevBehaviors()
    })

    // Save refs to related components
    this.morphAudioFeedback = this.el.querySelector('[morph-audio-feedback]').components['morph-audio-feedback']
    this.loopAnimation = this.el.parentEl.components['loop-animation']

    this.isPrimary = isPrimary
    window.debug = this

    modelEl.addEventListener('model-loaded', () => {
      this.headQuaternion = this.el.components['ik-controller'].headQuaternion
    })
  },
  stopPrevBehaviors: function () {
    // Pause eye animation
    this.loopAnimation.currentActions.forEach((action) => action.stop())

    // Pause mouth feedback
    this.morphAudioFeedback.pause()
    const { morphs } = this.morphAudioFeedback
    morphs.forEach(({ mesh, morphNumber }) => (mesh.morphTargetInfluences[morphNumber] = 0))
  },
  restartPrevBehaviors: function () {
    this.loopAnimation.currentActions.forEach((action) => action.play())
    this.morphAudioFeedback.play()
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
