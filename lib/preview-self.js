AFRAME.registerSystem('preview-self', {
  init: function () {
    // Create a camera facing the user that only "sees" a specific layer
    const camera = new THREE.PerspectiveCamera(10, 1, 0.1, 1000)
    camera.layers.set(10)
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
      avatarModelEl.object3D.traverse((o) => o.layers.enable(10))
      this.el.sceneEl.object3D.traverse((o) => o.isLight && o.layers.enable(10))
    })

    /**
     * Create render target where selfie image will be rendered
     * Use RGBA format to enable transparent background
     */
    const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
      format: THREE.RGBAFormat,
    })

    const previewEl = document.createElement('a-entity')

    // Create material pointing at our render target with alpha clipping
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: renderTarget.texture,
      transparent: true,
      alphaTest: 0.5,
      depthTest: false,
    })

    // Create surface to render onto
    const geometry = new THREE.PlaneGeometry()
    geometry.scale(-1, 1, 1) // Mirror it
    geometry.translate(-0.5, 0.5, 0)

    // Create a mesh for selfie image, place it at a distance and render on top
    const screen = new THREE.Mesh(geometry, material)
    screen.renderOrder = 100
    screen.position.set(0, 0, -2)
    screen.updateMatrix()

    // Keep everything fixed to user gaze
    previewEl.setObject3D('screen', screen)
    previewEl.setObject3D('faceCam', camera)
    povNode.appendChild(previewEl)

    window.selfie = this

    Object.assign(this, { screen, previewEl, camera, material, renderTarget })

    this.updateRenderTargetNextTick = false

    const fps = 30
    setInterval(() => {
      this.updateRenderTargetNextTick = true
    }, 1000 / fps)
  },
  tick: function () {
    this.reposition()
  },
  reposition: function () {
    // Position object origin (bottom-right) at center of physical screen, then project to NDC
    this.screen.position.set(0, 0, -2)
    this.screen.position.applyMatrix4(this.el.sceneEl.camera.projectionMatrix)
    // Move object origin (bottom-right) to bottom-right of NDC
    this.screen.position.x = 1
    this.screen.position.y = -1
    // Unproject back into view space (now object is displayed in bottom-right of view at the specified depth)
    this.screen.position.applyMatrix4(this.el.sceneEl.camera.projectionMatrixInverse)
    this.screen.updateMatrix()
  },
  tock: function () {
    // Ensure background is transparent
    this.el.sceneEl.object3D.background = null
    if (this.updateRenderTargetNextTick) {
      const renderer = this.el.sceneEl.renderer
      const scene = this.el.sceneEl.object3D

      const tmpOnAfterRender = scene.onAfterRender
      delete scene.onAfterRender

      showPlayerHead()
      renderer.setRenderTarget(this.renderTarget)
      renderer.render(scene, this.camera)
      renderer.setRenderTarget(null)
      scene.onAfterRender = tmpOnAfterRender
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
