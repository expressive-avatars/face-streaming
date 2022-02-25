const html = String.raw
const css = String.raw

const style = css`
  :host {
    overflow: hidden;
    transition: height 200ms ease-in-out;
    height: 0;
  }
`

const template = html` <slot></slot> `

class CollapsibleEl extends HTMLElement {
  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = `
      <style>${style}</style>
      ${template}
    `

    const host = this

    function collapse() {
      host.style.height = '0px'
    }
    function uncollapse() {
      host.style.height = host.scrollHeight + 'px'
    }
    function toggleCollapse() {
      if (host.style.height === '0px') {
        uncollapse()
      } else {
        collapse()
      }
    }

    // Public methods
    this.toggleCollapse = toggleCollapse

    // Init
    if (this.hasAttribute('collapsed')) {
      collapse()
    } else {
      uncollapse()
    }
  }
}

customElements.define('collapsible-el', CollapsibleEl)
