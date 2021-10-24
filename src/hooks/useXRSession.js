import { useState, useEffect } from 'react'

/**
 * @param {THREE.WebGLRenderer} gl
 */
export function useXRSession(gl) {
  const { xr } = gl
  const [session, setSession] = useState(() => xr.getSession())
  useEffect(() => {
    const handleSessionChange = () => setSession(xr.getSession())

    // Add listeners on mount
    xr.addEventListener('sessionstart', handleSessionChange)
    xr.addEventListener('sessionend', handleSessionChange)

    // Remove listeners on unmount
    return () => {
      xr.removeEventListener('sessionstart', handleSessionChange)
      xr.removeEventListener('sessionend', handleSessionChange)
    }
  }, [xr])
  return session
}
