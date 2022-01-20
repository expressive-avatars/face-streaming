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

    // COLLAPSE ACTION ROW
    const rowCollapser = h('div')
    rowCollapser.classList.add(style.row)

    // COLLAPSE ICON
    const iconCollapse = h('span')
    iconCollapse.className = 'bx bx-chevron-up'
    iconCollapse.style.fontSize = '20px'

    // COLLAPSE BUTTON
    const btnCollapse = h('button')
    btnCollapse.classList.add(style.btnCollapse)
    btnCollapse.addEventListener('click', () => this.togglePreview())

    // TARGET ICON
    const iconTarget = h('span')
    iconTarget.classList.add('bx', 'bx-target-lock')
    iconTarget.style.fontSize = '20px'

    // RECENTER BUTTON
    const btnRecenter = h('button')
    btnRecenter.classList.add(style.btn)

    // ROW OF BUTTONS
    const rowButtons = h('div')
    rowButtons.classList.add(style.row)

    // COLLAPSIBLE PREVIEW AREA
    const previewArea = h('div')
    previewArea.classList.add(style.previewArea)
    previewArea.appendChild(previewSelf.canvas)

    // WIDGET CONTAINER
    const widget = h('div')
    widget.className = style.widget

    // CONSTRUCT HEIRARCHY
    btnCollapse.appendChild(iconCollapse)

    btnRecenter.appendChild(iconTarget)
    btnRecenter.appendChild(document.createTextNode('Recenter'))

    rowCollapser.appendChild(btnCollapse)
    rowButtons.appendChild(btnRecenter)

    widget.appendChild(rowCollapser)
    widget.appendChild(previewArea)
    widget.appendChild(rowButtons)

    sceneOverlay.root.appendChild(widget)

    this.el.sceneEl.addEventListener('facetracking_ready', () => {
      previewArea.style.height = previewSelf.canvas.height + 'px'
      console.log('fired')
    })

    // Add members
    Object.assign(this, { widget, sceneOverlay, previewSelf, previewArea, iconCollapse })
  },
  enablePreview: function () {
    this.previewArea.style.height = this.previewSelf.canvas.height + 'px'
    this.iconCollapse.className = 'bx bx-chevron-down'
  },
  disablePreview: function () {
    this.previewArea.style.height = '0px'
    this.iconCollapse.className = 'bx bx-chevron-up'
  },
  togglePreview: function () {
    if (this.previewArea.style.height === '0px') {
      this.enablePreview()
    } else {
      this.disablePreview()
    }
  },
})
