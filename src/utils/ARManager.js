// Lifts functionality from ARButton.js example

export class ARManager {
  constructor(renderer, sessionInit = {}) {
    this.session = null
    this.renderer = renderer
    this.sessionInit = sessionInit
    this._makeDefaultOverlay()
  }

  _makeDefaultOverlay() {
    if (this.sessionInit.domOverlay === undefined) {
      const overlay = document.createElement('div')
      overlay.style.display = 'none'
      document.body.appendChild(overlay)

      if (this.sessionInit.optionalFeatures === undefined) {
        this.sessionInit.optionalFeatures = []
      }

      this.sessionInit.optionalFeatures.push('dom-overlay')
      this.sessionInit.domOverlay = { root: overlay }
    }
  }

  start() {
    navigator.xr
      .requestSession('immersive-ar', this.sessionInit)
      .then(this.onSessionStarted.bind(this))
      .catch((e) => console.log('Failed to start AR session'))
  }

  end() {
    this.session.end()
  }

  get domOverlay() {
    return this.sessionInit.domOverlay
  }

  async onSessionStarted(session) {
    this.session = session

    session.addEventListener('end', this.onSessionEnded.bind(this))
    this.renderer.xr.setReferenceSpaceType('local')

    await this.renderer.xr.setSession(session)

    this.sessionInit.domOverlay.root.style.display = ''
  }

  onSessionEnded() {
    this.session = null
  }
}
