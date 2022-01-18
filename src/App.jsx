import { Button } from '@/components/dom/Button'
import { useCredentials } from '@/hooks/useCredentials'

export default function App() {
  const credentials = useCredentials()
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <img alt="Augmented Environments Lab logo" src="/ael-logo.jpg" width={200} />
      {credentials ? <SignedIn /> : <SignedOut />}
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

function SignedIn() {
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
      <Button>Start Tracking</Button>
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
