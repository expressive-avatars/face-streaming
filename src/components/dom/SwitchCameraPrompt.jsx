export function SwitchCameraPrompt() {
  return (
    <div className="bg-white h-screen w-screen grid place-items-center gap-2">
      <ul className="w-72 list-decimal grid gap-2">
        <h1 className="font-bold mb-4 text-xl">Almost there...</h1>
        <li>Swipe down on the status bar at the top of the screen</li>
        <li>Tap the 3 dots in the URL bar</li>
        <img src="/breadcrumbs.jpg" />
        <li>Tap "Switch Camera"</li>
        <img src="/switch-camera.jpg" height={200} />
      </ul>
    </div>
  )
}
