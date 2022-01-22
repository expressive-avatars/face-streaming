import { store, useStore } from '@/store'
import { Button } from './Button'

export function TrackingPanel({ hubName }) {
  const onClickRecenter = () => store.calibrate()
  const snap = useStore()
  return (
    <div className="fixed bottom-0 flex justify-center w-full">
      <div className="bg-white rounded-t-lg shadow-lg w-[450px] mx-8 p-8 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="flex items-center gap-2">
            <StatusDot color={hubName ? 'green' : 'orange'} size={10} />
            {hubName ? 'Connected' : 'Waiting for connection...'}
          </span>
          <p className="text-hubs-gray">{hubName ?? 'Join a compatible room on Hubs desktop'}</p>
        </div>
        <span className="flex gap-4">
          <Button onClick={onClickRecenter}>
            <span className="bx bx-target-lock text-[20px]" /> Recenter
          </Button>
          <Button primary={snap.paused} className={`w-[50px]`} onClick={() => (store.paused = !store.paused)}>
            {snap.paused ? <span className="bx bx-play scale-[2]" /> : <span className="bx bx-pause scale-[2]" />}
          </Button>
          <Button primary={snap.previewHidden} className={`w-[50px]`} onClick={() => (store.previewHidden = !store.previewHidden)}>
            {snap.previewHidden ? <span className="bx bx-show scale-[2]" /> : <span className="bx bx-hide scale-[2]" />}
          </Button>
        </span>
      </div>
    </div>
  )
}

function StatusDot({ color = 'green', size = 10 }) {
  const style = {
    display: 'inline-block',
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: 9999,
  }
  return <div style={style} />
}
