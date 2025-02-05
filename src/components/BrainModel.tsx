import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { PerspectiveCamera } from '@react-three/drei';

export function BrainModel() {
  const brainRef = useRef<Mesh>(null);

  
  const { scene } = useGLTF('./Mew.glb');

  useFrame(() => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.005; 
    }
  });

  return (
    <>
   
      <ambientLight intensity={0.3} /> 
      <directionalLight position={[10, 10, 5]} intensity={1} /> 

 
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={75} near={0.1} far={1000} />

     
      <mesh ref={brainRef}>
      
        <primitive object={scene} position={[0, -2, 0]} scale={[3, 3, 3]} /> 
      </mesh>
    </>
  );
}
