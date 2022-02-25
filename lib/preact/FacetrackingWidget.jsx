import { useLayoutEffect, useRef, useReducer, useState } from 'preact/hooks'
import { Button } from './Button'
import { Collapsible } from './Collapsible'
import { SettingsPopup } from './SettingsPopup'

export function FacetrackingWidget({ canvasEl, onPreviewVisibilityChange, onAction }) {
  const canvasContainer = useRef()

  const previewReducer = (prevOpenPreview) => {
    const openPreview = !prevOpenPreview
    onPreviewVisibilityChange({ open: openPreview })
    return openPreview
  }
  const [openPreview, togglePreview] = useReducer(previewReducer, false)
  const [openSettings, setOpenSettings] = useState(false)

  useLayoutEffect(() => {
    canvasContainer.current.appendChild(canvasEl)
  }, [canvasEl])
  return (
    <>
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
            <Button onClick={() => setOpenSettings(!openSettings)}>
              <box-icon name="slider-alt"></box-icon>
            </Button>
          </div>
        </Collapsible>
      </div>
      {openSettings && <SettingsPopup onClose={() => setOpenSettings(false)} onAction={onAction} />}
    </>
  )
}
