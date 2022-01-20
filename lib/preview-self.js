const tmpSize = new THREE.Vector2()

const PREVIEW_LAYER = 10
const SIZE = 256

AFRAME.registerSystem('preview-self', {
  init: function () {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const context = canvas.getContext('2d')

    // Create a camera facing the user that only "sees" a specific layer
    const camera = new THREE.PerspectiveCamera(10, 1, 0.1, 1000)
    camera.layers.set(PREVIEW_LAYER)
    camera.position.z = -2
    camera.rotation.y = Math.PI
    camera.updateMatrix()

    const povNode = APP.scene.querySelector('#avatar-pov-node') // Follows user gaze
    const avatarModelEl = APP.scene.querySelector('#avatar-rig .model') // Avatar glTF

    /**
     * Layers don't cascade -- set the appropriate layer on each object
     * in the avatar glTF and on each light in the scene
     */
    avatarModelEl.addEventListener('model-loaded', () => {
      avatarModelEl.object3D.traverse((o) => o.layers.enable(PREVIEW_LAYER))
      this.el.sceneEl.object3D.traverse((o) => o.isLight && o.layers.enable(PREVIEW_LAYER))
      document.querySelector('[skybox]').object3D.traverse((o) => o.layers.enable(PREVIEW_LAYER))
    })

    /**
     * Create render target where selfie image will be rendered
     * Use RGBA format to enable transparent background
     */
    const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
      format: THREE.RGBAFormat,
    })

    const previewEl = document.createElement('a-entity')

    // Keep everything fixed to user gaze
    previewEl.setObject3D('faceCam', camera)
    povNode.appendChild(previewEl)

    window.selfie = this

    const scene = this.el.sceneEl.object3D
    const renderer = this.el.sceneEl.renderer

    Object.assign(this, { previewEl, camera, renderTarget, canvas, context, scene, renderer })

    this.updateRenderTargetNextTick = false

    const fps = 25
    setInterval(() => {
      this.updateRenderTargetNextTick = true
    }, 1000 / fps)
  },
  tick: function () {
    // BEFORE the scene has rendered normally
    this.renderPreview()
  },
  tock: function () {},
  renderPreview: function () {
    // Ensure background is transparent
    // this.el.sceneEl.object3D.background = null
    if (this.updateRenderTargetNextTick) {
      // MODIFY RENDER SETTINGS
      const tmpOnAfterRender = this.scene.onAfterRender
      delete this.scene.onAfterRender

      showPlayerHead()

      this.renderer.getSize(tmpSize)
      this.renderer.setSize(SIZE, SIZE, false)

      this.renderer.render(this.scene, this.camera)
      this.context.drawImage(this.renderer.domElement, 0, 0, SIZE, SIZE)

      // RESTORE RENDER SETTINGS
      this.scene.onAfterRender = tmpOnAfterRender
      this.renderer.setSize(tmpSize.x, tmpSize.y, false)

      hidePlayerHead()

      this.updateRenderTargetNextTick = false
    }
  },
})

function showPlayerHead() {
  const playerHead = APP.scene.systems['camera-tools'].playerHead
  if (playerHead) {
    playerHead.visible = true
    playerHead.scale.setScalar(1)
    playerHead.updateMatrices(true, true)
    playerHead.updateMatrixWorld(true, true)
  }
}

function hidePlayerHead() {
  const playerHead = APP.scene.systems['camera-tools'].playerHead
  if (playerHead) {
    playerHead.visible = false
    playerHead.scale.setScalar(1e-8)
    playerHead.updateMatrices(true, true)
    playerHead.updateMatrixWorld(true, true)
  }
}
