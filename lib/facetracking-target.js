import io from 'socket.io-client'

AFRAME.registerComponent('facetracking-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    this.socket = io(import.meta.env.VITE_BACKEND)
    this.headRotationMatrix = new THREE.Matrix4()

    const skinnedMeshes = []
    this.el.object3D.traverse((obj) => {
      if (obj.isSkinnedMesh && ['Wolf3D_Head', 'Wolf3D_Teeth'].includes(obj.name)) {
        skinnedMeshes.push(obj)
      }
    })

    const onFace = ({ blendShapes, matrix }) => {
      if (blendShapes && matrix) {
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
          for (let skinnedMesh of skinnedMeshes) {
            skinnedMesh.morphTargetInfluences[skinnedMesh.morphTargetDictionary[blendShape]] = factor * blendShapes[blendShape]
          }
        }
        this.headRotationMatrix.fromArray(matrix)
        this.headQuaternion?.setFromRotationMatrix(this.headRotationMatrix)
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
