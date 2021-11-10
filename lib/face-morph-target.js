import io from 'socket.io-client'

AFRAME.registerComponent('face-morph-target', {
  schema: {
    networkId: { type: 'string' },
  },
  init: function () {
    this.socket = io(import.meta.env.VITE_BACKEND)
    window.avatarRoot = this.el

    const skinnedMeshes = []
    this.el.object3D.traverse((obj) => {
      if (obj.isSkinnedMesh && ['Wolf3D_Head', 'Wolf3D_Teeth'].includes(obj.name)) {
        skinnedMeshes.push(obj)
      }
    })
    window.skinnedMeshes = skinnedMeshes

    const onFace = ({ blendShapes }) => {
      if (blendShapes) {
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
