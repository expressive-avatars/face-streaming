import io from 'socket.io-client'

const euler = new THREE.Euler()
const mat4 = new THREE.Matrix4()

AFRAME.registerComponent('facetracking-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: async function () {
    const networkedEl = await NAF.utils.getNetworkedEntity(this.el)
    // const networkedEd = this.el.parentEl.parentEl.parentEl
    const isPrimary = networkedEl === document.querySelector('#avatar-rig')
    this.socket = io(`${import.meta.env.VITE_BACKEND}/consumer`, {
      query: {
        type: isPrimary ? 'primary' : 'peer',
        email: isPrimary ? APP.store.state.credentials.email : undefined,
        networkId: NAF.utils.getNetworkId(networkedEl),
      },
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
      if (obj.isSkinnedMesh && ['Wolf3D_Head', 'Wolf3D_Teeth'].includes(obj.name)) {
        this.skinnedMeshes.push(obj)
      }
    })

    const onFace = ({ blendShapes, matrix }) => {
      if (blendShapes && matrix) {
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
        mat4.fromArray(matrix)
        euler.setFromRotationMatrix(mat4)
        euler.y = -euler.y
        euler.z = -euler.z
        this.headQuaternion?.setFromEuler(euler)
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
