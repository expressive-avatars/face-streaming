import io from 'socket.io-client'

const selectedBlendShapes = ['jawOpen', 'mouthSmileLeft', 'mouthSmileRight', 'mouthPucker', 'mouthShrugUpper']

AFRAME.registerComponent('face-morph-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    this.socket = io(import.meta.env.VITE_BACKEND)
    window.avatarRoot = this.el

    const skinnedMeshes = []
    this.el.object3D.traverse((obj) => {
      if (obj.isSkinnedMesh && hasSelectedBlendShapes(obj)) {
        skinnedMeshes.push(obj)
      }
    })
    window.skinnedMeshes = skinnedMeshes

    const onFace = ({ blendShapes }) => {
      if (blendShapes) {
        for (let blendShape of selectedBlendShapes) {
          for (let skinnedMesh of skinnedMeshes) {
            skinnedMesh.morphTargetInfluences[skinnedMesh.morphTargetDictionary[blendShape]] = blendShapes[blendShape]
          }
        }
        window.blendShapes = blendShapes
      }
    }
    this.socket.on('face', onFace)
  },
})

function hasSelectedBlendShapes(skinnedMesh) {
  return skinnedMesh.morphTargetDictionary && selectedBlendShapes.every((blendShape) => blendShape in skinnedMesh.morphTargetDictionary)
}

AFRAME.GLTFModelPlus.registerComponent('morph-audio-feedback', 'morph-audio-feedback', (el, componentName, componentData) => {
  console.log('Adding morph-audio-feedback')
  el.setAttribute(componentName, componentData)
  const avatarRoot = el.parentEl
  NAF.utils.getNetworkedEntity(el).then((networkedEl) => {
    const networkId = NAF.utils.getNetworkId(networkedEl)
    avatarRoot.setAttribute('face-morph-target', { networkId })
  })
})
