import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export function FacelessAvatar() {
  const { scene } = useGLTF('/faceless-avatar.glb', null, true)
  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.material.metalness = 1
        object.material.roughness = 0.1
        object.material.color.set('white')
      }
    })
  }, [scene])
  return <primitive object={scene} />
}
