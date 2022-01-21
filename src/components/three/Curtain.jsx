import { Box } from '@react-three/drei'
import { createPortal, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function Curtain({ color = 'white' }) {
  const { camera } = useThree()
  return createPortal(
    <Box>
      <meshBasicMaterial color={color} side={THREE.BackSide} />
    </Box>,
    camera
  )
}
