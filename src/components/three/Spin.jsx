import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function Spin({ speed = 1, ...rest }) {
  /** @type {React.RefObject<THREE.Group>} */
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x = ref.current.rotation.y += delta * speed
  })
  return <group ref={ref} {...rest} />
}
