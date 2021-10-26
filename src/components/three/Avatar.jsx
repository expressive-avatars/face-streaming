/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFacetracking } from '@/hooks/useFacetracking'
import { useSocket } from '@/hooks/useSocket'

export default function Avatar(props) {
  const { nodes, materials } = useGLTF('https://d1a370nemizbjq.cloudfront.net/54a8ca1e-1759-4cf9-ab76-bec155d6c83c.glb')

  const socket = useSocket('https://matt-backend.ngrok.io')

  useFacetracking((blendShapes) => {
    for (let blendShape in blendShapes) {
      // const i = head.current.morphTargetDictionary[blendShape]
      // nodes.Wolf3D_Head.morphTargetInfluences[i] = blendShapes[blendShape]
    }
    socket.volatile.emit('blendShapes', blendShapes)
  })

  return (
    <group {...props} dispose={null} visible={false}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Glasses.geometry} material={materials.Wolf3D_Glasses} skeleton={nodes.Wolf3D_Glasses.skeleton} />
      <skinnedMesh geometry={nodes.EyeLeft.geometry} material={nodes.EyeLeft.material} skeleton={nodes.EyeLeft.skeleton} />
      <skinnedMesh geometry={nodes.EyeRight.geometry} material={nodes.EyeRight.material} skeleton={nodes.EyeRight.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Hands.geometry} material={nodes.Wolf3D_Hands.material} skeleton={nodes.Wolf3D_Hands.skeleton} />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={nodes.Wolf3D_Head.material}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh geometry={nodes.Wolf3D_Shirt.geometry} material={materials.Wolf3D_Shirt} skeleton={nodes.Wolf3D_Shirt.skeleton} />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  )
}

useGLTF.preload('https://d1a370nemizbjq.cloudfront.net/54a8ca1e-1759-4cf9-ab76-bec155d6c83c.glb')