import { useState } from 'react'
import { Button } from '@/components/dom/Button'
import { ThreeApp } from '@/components/three/ThreeApp'
import { FacetrackingDebugger } from '@/components/three/FacetrackingDebugger'
import { useStore } from './store'

export default function App() {
  const [startedAR, setStartedAR] = useState(false)
  const onStartAR = () => {
    console.log('starting XR session')
    setStartedAR(true)
  }
  return <FacetrackingDebugger />
  // return startedAR ? <ThreeApp /> : <LandingPage onStartAR={onStartAR} />
}

function LandingPage({ onStartAR }) {
  const snap = useStore()
  const isSupportedBrowser = navigator.userAgent.includes('WebXRViewer')
  let body
  if (isSupportedBrowser) {
    if (snap.credentials) {
      body = <SignedIn onStartAR={onStartAR} />
    } else {
      body = <SignedOut />
    }
  } else {
    body = <UnsupportedBrowser />
  }
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <img alt="Augmented Environments Lab logo" src="/ael-logo.jpg" width={200} />
      {body}
    </div>
  )
}

function UnsupportedBrowser() {
  return (
    <div className="grid gap-10 place-items-center px-8">
      <p className="text-center">Please visit this page in WebXR Viewer on a supported iOS device.</p>
      <a
        href="https://apps.apple.com/us/app/webxr-viewer/id1295998056?itsct=apps_box_badge&amp;itscg=30200"
        style={{ display: 'inline-block', overflow: 'hidden', borderRadius: '13px', width: '250px', height: '83px' }}
      >
        <img
          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1512604800&h=337a4ee86d323f6cc8ce8ab793b4b045"
          alt="Download on the App Store"
          style={{ borderRadius: '13px', width: '250px', height: '83px' }}
        />
      </a>
    </div>
  )
}

function SignedOut() {
  const signInURL = createSigninURL()
  return (
    <a href={signInURL}>
      <Button>Sign In</Button>
    </a>
  )
}

function SignedIn({ onStartAR }) {
  const snap = useStore()
  const signInURL = createSigninURL()
  return (
    <>
      <div className="mb-6 text-center">
        <p>
          Signed in as <span className="font-semibold">{formatEmail(snap.credentials.email)}</span>
        </p>
        <a className="text-hubs-blue hover:text-hubs-lightblue" href={signInURL}>
          Switch account
        </a>
      </div>
      <Button primary onClick={onStartAR}>
        Start Tracking
      </Button>
    </>
  )
}

function formatEmail(email) {
  const [alias, domain] = email.split('@')
  return `${alias.substring(0, 3)}...@${domain}`
}

function createSigninURL() {
  const url = new URL('https://hubs.aelatgt.net/signin')
  url.searchParams.set('sign_in_destination_url', 'https://ios.aelatgt.net')
  return url.toString()
}
