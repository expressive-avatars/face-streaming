import './scene-overlay'
import './preview-self'
import style from './facetracking-widget.module.css'

const link = document.createElement('link')
link.href = 'https://cdn.jsdelivr.net/npm/boxicons@2.1.1/css/boxicons.min.css'
link.rel = 'stylesheet'
document.head.appendChild(link)

const h = document.createElement

AFRAME.registerSystem('facetracking-widget', {
  dependencies: ['scene-overlay', 'preview-self'],
  init: function () {
    const sceneOverlay = this.el.sceneEl.systems['scene-overlay']
    const previewSelf = this.el.sceneEl.systems['preview-self']

    const widget = h('div')
    widget.className = style.widget

    const previewArea = h('div')
    previewArea.appendChild(previewSelf.canvas)
    previewArea.classList.add(style.previewArea)

    widget.appendChild(previewArea)

    sceneOverlay.root.appendChild(widget)

    window.widgetSystem = this

    // TODO: Add buttons, emit calibration event on scene
    const btnRecenter = h('button')
    btnRecenter.classList.add(style.btn)

    // btnRecenter.innerText = 'Recenter'
    const iconTarget = h('span')
    iconTarget.classList.add('bx', 'bx-target-lock')
    iconTarget.style.fontSize = '20px'
    btnRecenter.appendChild(iconTarget)
    btnRecenter.appendChild(document.createTextNode('Recenter'))

    const row = h('div')
    row.classList.add(style.row)

    row.appendChild(btnRecenter)
    widget.appendChild(row)

    this.el.sceneEl.addEventListener('facetracking_ready', () => {
      previewArea.style.height = previewSelf.canvas.height + 'px'
      console.log('fired')
    })

    Object.assign(this, { widget, sceneOverlay, previewSelf })
  },
})
