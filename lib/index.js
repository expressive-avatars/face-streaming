import { initUIObserver } from './ui'
import './facetracking-target'
import './preview-self'
import './canvas-overlay'

initUIObserver()

/** @type {HTMLDivElement} */
const root = window.APP.scene.systems['canvas-overlay'].root

// Root covers entire canvas, disable pointer so mouse still works in scene
root.style.pointerEvents = 'none'

// Re-enable pointer on our positioned widget
const widget = document.createElement('div')
widget.style.pointerEvents = 'initial'

// Position widget in the bottom right corner
widget.style.position = 'absolute'
widget.style.bottom = widget.style.right = 0

const button = document.createElement('button')
button.innerText = 'Recenter'

button.onclick = () => 'clicked recenter'

Object.assign(widget.style, {
  padding: '10px 70px',
})

Object.assign(button.style, {
  padding: '10px 15px',
  backgroundColor: '#007ab8',
  color: 'white',
  border: 'none',
  boxShadow: '0 0 4px rgba(0,0,0,10%)',
  borderRadius: '6px',
})

root.appendChild(widget)
widget.appendChild(button)
