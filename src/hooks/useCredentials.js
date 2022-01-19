import { useState } from 'react'

/**
 * @returns {{ email: string, token: string }}
 */
export function useCredentials() {
  const [credentials] = useState(() => {
    if (import.meta.env.MODE === 'development') {
      return {
        email: import.meta.env.EMAIL,
        token: import.meta.env.TOKEN,
      }
    }
    try {
      const cookieData = getCookie('credentials')
      return JSON.parse(cookieData)
    } catch (e) {
      return null
    }
  })
  return credentials
}

function getCookie(cname) {
  let name = cname + '='
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
