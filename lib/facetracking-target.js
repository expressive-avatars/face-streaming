import io from 'socket.io-client'

const euler = new THREE.Euler()
const mat4 = new THREE.Matrix4()

console.log('facetracking-target.js')

AFRAME.registerComponent('facetracking-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    const networkedEl = this.el.closest('[networked-avatar]')
    const modelEl = this.el.closest('[gltf-model-plus]')

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

    const emitHubName = () => this.socket.emit('hub_name', APP.hub.name)
    const emitAvatarURL = () => this.socket.emit('avatar_url', modelEl.getAttribute('gltf-model-plus').src)
    const emitCalibrate = () => this.socket.emit('calibrate')

    this.el.sceneEl.addEventListener('hub_updated', () => emitHubName())
    this.el.sceneEl.addEventListener('facetracking_calibrate', () => emitCalibrate())
    emitHubName()
    emitAvatarURL()

    // Send hub/avatar status when iOS device joins
    this.socket.on('provider_join', () => {
      emitHubName()
      emitAvatarURL()
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
        // Debugging
        window.blendShapes = blendShapes

        for (let blendShape in blendShapes) {
          let factor
          switch (blendShape) {
            case 'mouthSmileLeft':
            case 'mouthSmileRight':
              factor = 0.6
              break
            default:
              factor = 1
          }
          for (let skinnedMesh of this.skinnedMeshes) {
            skinnedMesh.morphTargetInfluences[skinnedMesh.morphTargetDictionary[blendShape]] = factor * blendShapes[blendShape]
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
})

function hasSelectedBlendShapes(skinnedMesh) {
  return skinnedMesh.morphTargetDictionary && selectedBlendShapes.every((blendShape) => blendShape in skinnedMesh.morphTargetDictionary)
}

// morph-audio-feedback gets attached to every RPM avatar, hook into that
AFRAME.GLTFModelPlus.registerComponent('morph-audio-feedback', 'morph-audio-feedback', (el, componentName, componentData) => {
  console.log('Adding morph-audio-feedback')
  el.setAttribute(componentName, componentData)
  const avatarRoot = el.parentEl
  NAF.utils.getNetworkedEntity(el).then((networkedEl) => {
    const networkId = NAF.utils.getNetworkId(networkedEl)
    avatarRoot.setAttribute('facetracking-target', { networkId })
  })
})
