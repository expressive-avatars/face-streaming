import io from 'socket.io-client'

const selectedBlendShapes = ['jawOpen', 'mouthSmileLeft', 'mouthSmileRight', 'mouthPucker', 'mouthShrugUpper']

AFRAME.registerComponent('face-morph-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    console.log('adding face-morph-target with networkId', this.data.networkId)
    console.log('connecting socket to', import.meta.env.VITE_BACKEND)
    this.socket = io(import.meta.env.VITE_BACKEND)

    const skinnedMesh = this.el.object3DMap.skinnedmesh
    const onFace = ({ blendShapes }) => {
      if (blendShapes) {
        for (let blendShape of selectedBlendShapes) {
          skinnedMesh.morphTargetInfluences[skinnedMesh.morphTargetDictionary[blendShape]] = blendShapes[blendShape]
        }
        window.blendShapes = blendShapes
      }
    }
    window.skinnedMesh = skinnedMesh
    this.socket.on('face', onFace)
  },
})

function hasBlendShapes(skinnedMesh) {
  return selectedBlendShapes.every((blendShape) => blendShape in skinnedMesh.morphTargetDictionary)
}

AFRAME.GLTFModelPlus.registerComponent('morph-audio-feedback', 'morph-audio-feedback', (el, componentName, componentData) => {
  console.log('Adding morph-audio-feedback')
  el.setAttribute(componentName, componentData)
  NAF.utils.getNetworkedEntity(el).then((networkedEl) => {
    const networkId = NAF.utils.getNetworkId(networkedEl)
    el.setAttribute('face-morph-target', { networkId })
  })
})
