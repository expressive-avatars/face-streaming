import { useState } from 'react'
import io from 'socket.io-client'

export function useSocket(url) {
  const [socket] = useState(() => {
    return io(url)
  })
  return socket
}
