const html = String.raw
const css = String.raw

const style = css`
  #collapsible {
    overflow: hidden;
    transition: height 200ms ease-in-out;
    height: 0;
  }
`

const template = html`
  <div id="collapsible">
    <slot></slot>
  </div>
`

class CollapsibleDiv extends HTMLElement {
  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = `
      <style>${style}</style>
      ${template}
    `

    const collapsible = root.querySelector('#collapsible')

    function collapse() {
      collapsible.style.height = '0px'
    }
    function uncollapse() {
      collapsible.style.height = collapsible.scrollHeight + 'px'
    }
    function toggleCollapse() {
      if (collapsible.style.height === '0px') {
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

customElements.define('collapsible-div', CollapsibleDiv)
