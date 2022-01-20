/**
 * Creates a root element overlaying the A-Frame canvas
 *
 * Usage: append DOM elements to this.root
 */
AFRAME.registerSystem('canvas-overlay', {
  init: function () {
    this.root = document.createElement('div')
    this.root.style.position = 'fixed'
    document.body.appendChild(this.root)

    this.canvas = this.el.sceneEl.canvas
  },
  tick: function () {
    this.resize()
  },
  resize: function () {
    this.root.style.width = this.canvas.clientWidth + 'px'
    this.root.style.height = this.canvas.clientHeight + 'px'
  },
})
