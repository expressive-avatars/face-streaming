import style from './CalibrationPopup.module.css'

export class CalibrationPopup {
  constructor() {
    const layout = document.createElement('div')
    layout.classList.add(style.layout)

    const container = document.createElement('div')
    container.classList.add(style.container)

    const instructions = document.createElement('p')
    instructions.classList.add(style.instructions)
    instructions.innerText = 'Look at the target'

    const target = document.createElement('div')
    target.classList.add(style.target)

    const countdown = document.createElement('span')
    countdown.classList.add(style.countdown)
    countdown.innerText = '3'

    // Construct heirarchy
    target.appendChild(countdown)

    container.appendChild(instructions)
    container.appendChild(target)

    layout.appendChild(container)

    this.domElement = layout
    this.countdownEl = countdown
    this.timeout = null

    this._hide()
  }

  startCountdown(totalSeconds, onComplete) {
    const doCountdown = (seconds) => {
      this.countdownEl.innerText = seconds
      if (seconds === 0) {
        // Base case
        this._hide()
        onComplete()
      } else {
        // Recurse
        this.timeout = setTimeout(() => doCountdown(seconds - 1), 1000)
      }
    }
    clearTimeout(this.timeout)
    doCountdown(totalSeconds)
    this._show()
  }

  _hide() {
    this.domElement.style.display = 'none'
  }

  _show() {
    this.domElement.style.display = ''
  }
}
