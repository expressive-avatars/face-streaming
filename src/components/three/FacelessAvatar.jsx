import { useFacetracking } from '@/hooks/useFacetracking'
import { CPUMorpher } from '@/objects/CPUMorpher'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const mat4 = new THREE.Matrix4()

let didLog = false

export function FacelessAvatar() {
  const { scene, nodes } = useGLTF('/faceless-avatar.glb', null, true)

  /**
   * @type {{
   * bones: {[boneName: string]: THREE.Bone},
   * meshes: THREE.Mesh[]
   * morphers: CPUMorpher[]
   * }}
   */
  const { bones, meshes, morphers } = useMemo(() => {
    const bones = {
      head: nodes.Head,
      eyeL: nodes.LeftEye,
      eyeR: nodes.RightEye,
    }

    const meshes = []
    scene.traverse((object) => {
      if (object.isMesh && object.morphTargetInfluences.length > 0) {
        meshes.push(object)
      }
    })

    const morphers = meshes.map((mesh) => new CPUMorpher(mesh))

    return { bones, meshes, morphers }
  }, [nodes])

  Object.assign(window, { meshes })

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.material.metalness = 1
        object.material.roughness = 0.1
        object.material.color.set('white')
      }
    })
  }, [scene])
  useFacetracking((blendShapes, transform) => {
    // Update bones
    mat4.fromArray(transform)
    bones.head.setRotationFromMatrix(mat4)

    if (!didLog) {
      console.log(blendShapes, transform)
      didLog = true
    }

    // Update morphs
    for (let morpher of morphers) {
      for (let blendShape in blendShapes) {
        const i = morpher.mesh.morphTargetDictionary[blendShape]
        morpher.morphTargetInfluences[i] = blendShapes[blendShape]
      }
      morpher.update()
    }
  })
  return <primitive object={scene} />
}

useGLTF.preload('/faceless-avatar.glb')
