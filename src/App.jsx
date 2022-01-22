import { useState } from 'react'
import { Button } from '@/components/dom/Button'
import { SwitchCameraPrompt } from '@/components/dom/SwitchCameraPrompt'
import { useCredentials } from '@/hooks/useCredentials'
import { ThreeApp } from '@/components/three/ThreeApp'

export default function App() {
  const [startedAR, setStartedAR] = useState(false)
  const onStartAR = () => {
    console.log('starting XR session')
    setStartedAR(true)
  }
  return startedAR ? <ThreeApp /> : <LandingPage onStartAR={onStartAR} />
}

function LandingPage({ onStartAR }) {
  const credentials = useCredentials()
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <img alt="Augmented Environments Lab logo" src="/ael-logo.jpg" width={200} />
      {credentials ? <SignedIn onStartAR={onStartAR} /> : <SignedOut />}
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
  const { email } = useCredentials()
  const signInURL = createSigninURL()
  return (
    <>
      <div className="mb-6 text-center">
        <p>
          Signed in as <span className="font-semibold">{formatEmail(email)}</span>
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
