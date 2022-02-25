import { useLayoutEffect, useRef, useReducer } from 'preact/hooks'

export function FacetrackingWidget({ canvasEl, onPreviewCollapse, onPreviewUncollapse }) {
  const canvasContainer = useRef()

  const previewReducer = (prevOpenPreview) => {
    const openPreview = !prevOpenPreview
    if (openPreview) {
      onPreviewUncollapse()
    } else {
      onPreviewCollapse()
    }
    return openPreview
  }
  const [openPreview, togglePreview] = useReducer(previewReducer, false)

  useLayoutEffect(() => {
    canvasContainer.current.appendChild(canvasEl)
  }, [canvasEl])
  return (
    <div class="absolute bottom-0 right-0 mx-4 px-4 bg-white rounded-t-xl pointer-events-auto">
      <button class="flex fill-current text-hubs-gray justify-center w-full focus:outline-none" onClick={togglePreview}>
        <box-icon name={openPreview ? 'chevron-down' : 'chevron-up'}></box-icon>
      </button>
      <Collapsible open={openPreview}>
        <div ref={canvasContainer} class="mb-4" />
        <div class="flex justify-center gap-2 mb-4">
          <Button>
            <box-icon name="pause"></box-icon>Pause
          </Button>
          <Button>
            <box-icon name="slider-alt"></box-icon>
          </Button>
        </div>
      </Collapsible>
    </div>
  )
}

function Collapsible({ children, open }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current.style.height = `${open ? ref.current.scrollHeight : 0}px`
  }, [ref, open])
  return (
    <div
      ref={ref}
      style={{
        overflow: 'hidden',
        transition: 'height 200ms ease-in-out',
      }}
    >
      {children}
    </div>
  )
}

function Button({ ...props }) {
  return (
    <button
      class="border-2 border-hubs-blue text-hubs-blue hover:focus:(border-hubs-lightblue text-hubs-lightblue)
        rounded-xl px-4 py-2 grid grid-flow-col place-items-center
        focus:outline-none"
      {...props}
    />
  )
}
