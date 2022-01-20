import { useGLTF } from '@react-three/drei'

export function ReadyPlayerMeAvatar({ path }) {
  const { scene, nodes } = useGLTF(path)

  return (
    <group dispose={null}>
      <primitive object={scene} />
    </group>
  )
}
