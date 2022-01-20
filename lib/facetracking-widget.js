import './scene-overlay'
import './preview-self'

AFRAME.registerSystem('facetracking-widget', {
  dependencies: ['scene-overlay', 'preview-self'],
  init: function () {
    const sceneOverlay = this.el.sceneEl.systems['scene-overlay']
    const previewSelf = this.el.sceneEl.systems['preview-self']

    const widget = document.createElement('div')
    Object.assign(widget.style, {
      position: 'absolute',
      bottom: 0,
      right: 0,
      pointerEvents: 'initial',
    })

    // const canvas = document.createElement('canvas')
    // canvas.width = 300
    // canvas.height = 300
    widget.appendChild(previewSelf.canvas)

    sceneOverlay.root.appendChild(widget)

    window.widgetSystem = this

    // const context = canvas.getContext('2d')

    Object.assign(this, { widget, sceneOverlay, previewSelf })
  },
  tick: function () {
    // this.context.drawImage(this.previewSelf.renderTarget.texture.image)
  },
})
