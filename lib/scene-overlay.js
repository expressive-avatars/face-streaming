import { setup } from 'twind/shim'

/**
 * Creates a root element overlaying the A-Frame canvas
 *
 * Usage: append DOM elements to this.root
 */
AFRAME.registerSystem('scene-overlay', {
  init: function () {
    this.root = document.createElement('div')
    this.root.style.position = 'fixed'
    this.root.style.pointerEvents = 'none'
    this.root.style.overflow = 'hidden'
    document.body.appendChild(this.root)

    setup({
      target: this.root,
      theme: {
        fontFamily: {
          sans: 'Poppins, sans-serif',
        },
        extend: {
          colors: {
            'hubs-gray': '#868686',
            'hubs-blue': '#007AB8',
            'hubs-lightblue': '#008BD1',
          },
        },
      },
    })

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
