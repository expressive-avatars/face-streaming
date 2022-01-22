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
  schema: {
    paused: { default: false },
  },
  init: function () {
    this.el.sceneEl.addEventListener('facetracking_getstate', (e) => {
      this.el.setAttribute('facetracking-widget', e.detail)
    })

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
    btnCollapse.addEventListener('click', () => this.toggleCollapse())

    // TARGET ICON
    const iconTarget = h('span')
    iconTarget.classList.add('bx', 'bx-target-lock')
    iconTarget.style.fontSize = '20px'

    // PAUSE/PLAY ICON
    const iconPause = h('span')
    iconPause.className = 'bx bx-pause'
    iconPause.style.fontSize = '20px'
    iconPause.style.transform = 'scale(1.5)'

    // RECENTER BUTTON
    const btnRecenter = h('button')
    btnRecenter.classList.add(style.btn)
    btnRecenter.addEventListener('click', () => this.el.sceneEl.emit('facetracking_action', 'calibrate'))

    // PAUSE BUTTON
    const btnPause = h('button')
    btnPause.classList.add(style.btn)
    btnPause.style.width = '50px'
    btnPause.addEventListener('click', () => {
      const paused = !this.data.paused
      this.el.sceneEl.emit('facetracking_setstate', { paused })
      this.el.setAttribute('facetracking-widget', { paused })
    })

    // ROW OF BUTTONS
    const rowButtons = h('div')
    rowButtons.classList.add(style.row)
    rowButtons.style.margin = '15px 0'

    // COLLAPSIBLE AREA
    const collapsible = h('div')
    collapsible.classList.add(style.collapsible)

    // WIDGET CONTAINER
    const widget = h('div')
    widget.className = style.widget

    // CONSTRUCT HEIRARCHY
    btnCollapse.appendChild(iconCollapse)

    btnRecenter.appendChild(iconTarget)
    btnRecenter.appendChild(document.createTextNode('Recenter'))

    btnPause.appendChild(iconPause)

    collapsible.appendChild(previewSelf.canvas)
    collapsible.appendChild(rowButtons)
    previewSelf.canvas.style.transform = 'scaleX(-1)'

    rowCollapser.appendChild(btnCollapse)
    rowButtons.appendChild(btnRecenter)
    rowButtons.appendChild(btnPause)

    widget.appendChild(rowCollapser)
    widget.appendChild(collapsible)

    sceneOverlay.root.appendChild(widget)

    this.el.sceneEl.addEventListener('facetracking_start', () => {
      this.uncollapse()
    })

    // Add members
    Object.assign(this, { widget, sceneOverlay, previewSelf, collapsible, iconCollapse, iconPause, btnPause })
  },
  update: function () {
    this.iconPause.className = this.data.paused ? 'bx bx-play' : 'bx bx-pause'
    if (this.data.paused) {
      this.btnPause.classList.add(style.primary)
    } else {
      this.btnPause.classList.remove(style.primary)
    }
  },
  uncollapse: function () {
    this.collapsible.style.height = this.collapsible.scrollHeight + 'px'
    this.iconCollapse.className = 'bx bx-chevron-down'
    this.previewSelf.enabled = true
  },
  collapse: function () {
    this.collapsible.style.height = '0px'
    this.iconCollapse.className = 'bx bx-chevron-up'
    setTimeout(() => (this.previewSelf.enabled = false), 200)
  },
  toggleCollapse: function () {
    if (this.collapsible.style.height === '0px') {
      this.uncollapse()
    } else {
      this.collapse()
    }
  },
})
