import './collapsible-div.webcomponent'
import 'boxicons'

const html = String.raw
const css = String.raw

const template = html`
  <div class="widget">
    <div class="row">
      <button id="btnCollapse" class="btnCollapse">
        <box-icon id="collapse-preview-indicator" name="chevron-up"></box-icon>
      </button>
    </div>
    <collapsible-div collapsed id="collapsible-preview">
      <slot></slot>
      <div class="row">
        <button id="btnPause" class="btn"><box-icon name="pause"></box-icon>Pause</button>
        <button id="btnSettings" class="btn"><box-icon name="slider-alt"></box-icon></button>
      </div>
      <div class="row"></div>
    </collapsible-div>
  </div>
`

const style = css`
  * {
    font-family: Poppins, sans-serif;
    font-size: 16px;
  }

  :host {
    --hubs-blue: #007ab8;
    --hubs-lightblue: #008bd1;
    --hubs-gray: #868686;
  }

  button {
    line-height: unset;
  }

  .widget {
    --border-radius: 20px;
    pointer-events: initial;
    padding: 0 15px;
    background-color: white;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    box-shadow: 0 0 5px rgb(0, 0, 0, 10%);
  }

  .row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    color: var(--hubs-gray);
  }

  .btn {
    --btn-color: var(--hubs-blue);
    background: none;
    padding: 8px 12px;
    border-radius: 10px;
    border: 2px solid var(--btn-color);
    color: var(--btn-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .primary {
    background: var(--btn-color);
    border: none;
    color: white;
  }

  .btn:hover {
    --btn-color: var(--hubs-lightblue);
  }

  .btnCollapse {
    background: none;
    border: none;
    color: var(--hubs-gray);
    flex-grow: 1;
  }

  box-icon {
    fill: currentColor;
  }

  #collapsible-preview {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`

class FacetrackingWidget extends HTMLElement {
  constructor() {
    super()
    const host = this

    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>${style}</style>${template}`

    const collapsiblePreview = root.querySelector('#collapsible-preview')
    const collapsePreviewIndicator = root.querySelector('#collapse-preview-indicator')

    let previewCollapsed = true

    function toggleCollapsePreview() {
      previewCollapsed = !previewCollapsed
      collapsiblePreview.toggleCollapse()
      toggleCollapseIndicator()
      host.dispatchEvent(new CustomEvent(previewCollapsed ? 'preview_collapse' : 'preview_uncollapse'))
    }

    function toggleCollapseIndicator() {
      collapsePreviewIndicator.setAttribute('name', previewCollapsed ? 'chevron-up' : 'chevron-down')
    }

    const btnCollapse = root.querySelector('#btnCollapse')
    btnCollapse.addEventListener('click', toggleCollapsePreview)
  }
}

customElements.define('facetracking-widget', FacetrackingWidget)
