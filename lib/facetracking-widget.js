import './scene-overlay'
import './preview-self'
import style from './facetracking-widget.module.css'

AFRAME.registerSystem('facetracking-widget', {
  dependencies: ['scene-overlay', 'preview-self'],
  init: function () {
    const sceneOverlay = this.el.sceneEl.systems['scene-overlay']
    const previewSelf = this.el.sceneEl.systems['preview-self']

    const widget = document.createElement('div')
    widget.className = style.widget

    widget.appendChild(previewSelf.canvas)

    sceneOverlay.root.appendChild(widget)

    window.widgetSystem = this

    Object.assign(this, { widget, sceneOverlay, previewSelf })
  },
})
