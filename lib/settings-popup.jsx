import { useEffect } from 'preact/hooks'
import register from 'preact-custom-element'

const SettingsPopup = () => {
  useEffect(() => {
    console.log('hello preact')
  })
  return <div>Hello settings</div>
}

register(SettingsPopup, 'settings-popup')
