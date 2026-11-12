'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Character({ waving, speaking }: { waving: boolean; speaking: boolean }) {
  const root = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const eyes = useRef<THREE.Group[]>([]);
  const waveStart = useRef<number | null>(null);
  const skin = '#8d4c32';
  const hair = '#171313';
  const orange = '#e97843';
  const white = '#f8f5ef';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) {
      root.current.position.y = -1.35 + Math.sin(t * 1.25) * 0.035;
      root.current.rotation.y = Math.sin(t * 0.42) * 0.045;
      root.current.rotation.z = Math.sin(t * 0.7) * 0.012;
    }
    if (leftArm.current) leftArm.current.rotation.z = 0.08 + Math.sin(t * 1.1) * 0.025;
    if (rightArm.current) {
      if (waving) {
        if (waveStart.current === null) waveStart.current = t;
        const elapsed = t - waveStart.current;
        rightArm.current.rotation.z = THREE.MathUtils.damp(rightArm.current.rotation.z, -2.48 + Math.sin(elapsed * 9) * 0.34, 12, 1 / 60);
        rightArm.current.rotation.x = Math.sin(elapsed * 9) * 0.12;
      } else {
        waveStart.current = null;
        rightArm.current.rotation.z = THREE.MathUtils.damp(rightArm.current.rotation.z, -0.12, 5, 1 / 60);
        rightArm.current.rotation.x = THREE.MathUtils.damp(rightArm.current.rotation.x, 0, 5, 1 / 60);
      }
    }
    // Gentle periodic blinks; the eye groups compress vertically for a moment.
    const blink = Math.pow(Math.max(0, Math.cos(t * 0.72 + 0.8)), 42);
    eyes.current.forEach((eye) => { if (eye) eye.scale.y = 1 - blink * 0.88; });
    if (mouth.current) mouth.current.scale.y = speaking ? 0.075 + (0.035 * Math.abs(Math.sin(t * 13))) : 0.075;
  });

  return <group ref={root} position={[0, -1.35, 0]}>
    {/* torso, orange knit top and white collar */}
    <mesh position={[0, 0.2, 0]} castShadow><capsuleGeometry args={[0.64, 0.95, 8, 24]}/><meshStandardMaterial color={orange} roughness={0.88}/></mesh>
    <mesh position={[0, 0.93, 0.02]}><boxGeometry args={[0.9, 0.42, 0.12]}/><meshStandardMaterial color={white}/></mesh>
    <mesh position={[-0.2, 0.91, 0.1]} rotation={[0, 0, 0.22]}><coneGeometry args={[0.22, 0.36, 4]}/><meshStandardMaterial color={white}/></mesh>
    <mesh position={[0.2, 0.91, 0.1]} rotation={[0, 0, -0.22]}><coneGeometry args={[0.22, 0.36, 4]}/><meshStandardMaterial color={white}/></mesh>
    <mesh position={[0, 1.05, 0.02]}><cylinderGeometry args={[0.19, 0.22, 0.42, 24]}/><meshStandardMaterial color={skin}/></mesh>
    {/* head and ears */}
    <mesh position={[0, 1.83, 0]} scale={[0.94, 1.08, 0.91]} castShadow><sphereGeometry args={[0.73, 48, 48]}/><meshStandardMaterial color={skin} roughness={0.72}/></mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 0.69, 1.76, 0]}><sphereGeometry args={[0.13, 20, 20]}/><meshStandardMaterial color={skin}/></mesh>)}
    {/* braided hair cap, centre part and side braids */}
    <mesh position={[0, 2.12, -0.08]} scale={[1.02, 0.92, 0.95]}><sphereGeometry args={[0.72, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.68]}/><meshStandardMaterial color={hair} roughness={0.95}/></mesh>
    <mesh position={[0, 2.73, 0.31]} rotation={[0.12, 0, 0]}><capsuleGeometry args={[0.018, 0.55, 4, 8]}/><meshStandardMaterial color="#6f5148"/></mesh>
    {Array.from({ length: 8 }).map((_, i) => [-1, 1].map((side) => <group key={`${i}-${side}`} position={[side * (0.13 + i * 0.066), 2.45 - i * 0.055, 0.025]} rotation={[0, 0, side * (0.22 + i * 0.055)]}>
      <mesh><capsuleGeometry args={[0.047, 0.42, 5, 9]}/><meshStandardMaterial color={i % 2 ? '#211a19' : '#30201d'} roughness={0.9}/></mesh>
      <mesh position={[0, -0.17, 0.018]}><sphereGeometry args={[0.047, 12, 10]}/><meshStandardMaterial color="#241b19"/></mesh>
    </group>))}
    {/* brows and expressive eyes */}
    {[-1, 1].map((side, index) => <group key={`eye-${side}`} ref={(node) => { if (node) eyes.current[index] = node; }} position={[side * 0.29, 1.94, 0.62]}>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, -side * 0.08]}><capsuleGeometry args={[0.035, 0.23, 4, 8]}/><meshStandardMaterial color={hair}/></mesh>
      <mesh><sphereGeometry args={[0.105, 24, 20]}/><meshStandardMaterial color="#f3e6d8"/></mesh>
      <mesh position={[0, 0, 0.085]}><sphereGeometry args={[0.057, 20, 20]}/><meshStandardMaterial color="#241713"/></mesh>
      <mesh position={[0.018, 0.025, 0.132]}><sphereGeometry args={[0.018, 12, 12]}/><meshBasicMaterial color="white"/></mesh>
    </group>)}
    {/* nose, smile and animated mouth */}
    <mesh position={[0, 1.72, 0.68]} rotation={[0.2, 0, 0]}><coneGeometry args={[0.105, 0.28, 24]}/><meshStandardMaterial color="#99563b"/></mesh>
    <mesh ref={mouth} position={[0, 1.49, 0.65]} scale={[0.27, 0.075, 0.045]}><sphereGeometry args={[1, 24, 16]}/><meshStandardMaterial color="#54251f"/></mesh>
    <mesh position={[0, 1.515, 0.69]} scale={[0.205, 0.026, 0.018]}><boxGeometry args={[1, 1, 1]}/><meshStandardMaterial color="#fff8ed"/></mesh>
    {/* relaxed left arm */}
    <group ref={leftArm} position={[-0.62, 0.65, 0]}>
      <mesh position={[-0.1, -0.35, 0]} rotation={[0, 0, -0.22]}><capsuleGeometry args={[0.16, 0.62, 6, 12]}/><meshStandardMaterial color={orange}/></mesh>
      <mesh position={[-0.18, -0.76, 0.02]}><sphereGeometry args={[0.16, 20, 16]}/><meshStandardMaterial color={skin}/></mesh>
    </group>
    {/* right arm pivots at shoulder; wrist and fingers move as one waving hand */}
    <group ref={rightArm} position={[0.62, 0.65, 0]}>
      <mesh position={[0.08, -0.34, 0]} rotation={[0, 0, 0.18]}><capsuleGeometry args={[0.16, 0.62, 6, 12]}/><meshStandardMaterial color={orange}/></mesh>
      <group position={[0.16, -0.73, 0.02]}>
        <mesh><sphereGeometry args={[0.17, 20, 16]}/><meshStandardMaterial color={skin}/></mesh>
        {[-0.105, -0.035, 0.035, 0.105].map((x, i) => <mesh key={i} position={[x, 0.17 + (i === 1 || i === 2 ? 0.04 : 0), 0]} rotation={[0, 0, x * 1.4]}><capsuleGeometry args={[0.035, 0.22, 4, 8]}/><meshStandardMaterial color={skin}/></mesh>)}
        <mesh position={[0.2, -0.01, 0]} rotation={[0, 0, -0.9]}><capsuleGeometry args={[0.04, 0.16, 4, 8]}/><meshStandardMaterial color={skin}/></mesh>
      </group>
    </group>
    {/* necklace pendant */}
    <mesh position={[0, 0.91, 0.13]}><torusGeometry args={[0.11, 0.018, 8, 28]}/><meshStandardMaterial color="#b9a17b" metalness={0.65}/></mesh>
  </group>;
}

export default function TwinAvatar3D() {
  const [waving, setWaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [greeting, setGreeting] = useState('');
  function sayHello() {
    const text = 'Hello! Welcome to The Curious Lab. It’s lovely to meet you!';
    setWaving(true); setSpeaking(true); setGreeting(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-NG'; utterance.rate = 0.94; utterance.pitch = 1.05;
      utterance.onend = () => { setWaving(false); setSpeaking(false); };
      utterance.onerror = () => { setWaving(false); setSpeaking(false); };
      window.speechSynthesis.speak(utterance);
    } else {
      globalThis.setTimeout(() => {
        setWaving(false);
        setSpeaking(false);
      }, 2600);
    }
  }
  return <div className="twin-3d-stage">
    <Canvas camera={{ position: [0, 1.25, 5.4], fov: 34 }} dpr={[1, 1.6]}>
      <ambientLight intensity={1.6}/><directionalLight position={[3, 5, 4]} intensity={2.1} castShadow/><pointLight position={[-3, 2, 2]} intensity={0.7} color="#f6b18e"/>
      <Suspense fallback={null}><Character waving={waving} speaking={speaking}/></Suspense>
    </Canvas>
    <div className="twin-3d-controls"><button type="button" onClick={sayHello}>✳ Say hello</button>{greeting && <span>{greeting}</span>}</div>
    <small className="twin-3d-caption">LIVE 3D PROTOTYPE · WAVE · BLINK · SPEAKING EXPRESSION</small>
  </div>;
}
