import { useMemo } from 'react'
import io from 'socket.io-client'

export function useSocket(url, opts) {
  const socket = useMemo(() => {
    return io(url, opts)
  }, [url])
  return socket
}
