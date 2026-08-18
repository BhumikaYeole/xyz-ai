'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { VoiceStatus } from '@/lib/use-voice';

interface ThreeAvatarProps {
  role: string;
  voiceStatus: VoiceStatus;
}

const ROLE_THEMES: Record<string, {
  skinColor: number;
  hairColor: number;
  accentColor: number;
  accessory: 'glasses' | 'cap' | 'tie' | 'badge';
}> = {
  student: {
    skinColor: 0xffdfc4,
    hairColor: 0x2c1b18,
    accentColor: 0x8b5cf6,
    accessory: 'cap',
  },
  parent: {
    skinColor: 0xf5d0b5,
    hairColor: 0x3d2314,
    accentColor: 0x8b5cf6,
    accessory: 'glasses',
  },
  teacher: {
    skinColor: 0xffe0bd,
    hairColor: 0x1f2937,
    accentColor: 0x8b5cf6,
    accessory: 'glasses',
  },
  principal: {
    skinColor: 0xf2c49b,
    hairColor: 0x4b5563,
    accentColor: 0x8b5cf6,
    accessory: 'tie',
  },
};

export default function ThreeAvatar({ role, voiceStatus }: ThreeAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(voiceStatus);
  statusRef.current = voiceStatus;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 140;
    const height = container.clientHeight || 140;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.6);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.5);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // Character Group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    const theme = ROLE_THEMES[role] || ROLE_THEMES.student;

    // Head
    const headGeo = new THREE.SphereGeometry(0.65, 32, 32);
    headGeo.scale(1, 1.15, 0.95);
    const skinMat = new THREE.MeshStandardMaterial({
      color: theme.skinColor,
      roughness: 0.55,
      metalness: 0.05,
    });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    characterGroup.add(headMesh);

    // Neck & Torso
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.35, 20);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, -0.75, 0);
    characterGroup.add(neckMesh);

    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.65, 0.65, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.7,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, -1.15, 0);
    characterGroup.add(bodyMesh);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    hairGeo.scale(1.02, 1.1, 1.02);
    const hairMat = new THREE.MeshStandardMaterial({
      color: theme.hairColor,
      roughness: 0.8,
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.15, -0.05);
    characterGroup.add(hairMesh);

    // Left & Right Eyes (Eyeballs)
    const eyeGeo = new THREE.SphereGeometry(0.12, 24, 24);
    eyeGeo.scale(1, 1.2, 0.8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.22, 0.1, 0.52);
    characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.22, 0.1, 0.52);
    characterGroup.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1 });

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.22, 0.1, 0.6);
    characterGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.22, 0.1, 0.6);
    characterGroup.add(rightPupil);

    // Eyelids for realistic blinking
    const eyelidGeo = new THREE.SphereGeometry(0.13, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const eyelidMat = new THREE.MeshStandardMaterial({ color: theme.skinColor, roughness: 0.6 });
    
    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.22, 0.14, 0.53);
    leftEyelid.rotation.x = -Math.PI * 0.5;
    characterGroup.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    rightEyelid.position.set(0.22, 0.14, 0.53);
    rightEyelid.rotation.x = -Math.PI * 0.5;
    characterGroup.add(rightEyelid);

    // Cheeks (blush)
    const blushGeo = new THREE.CircleGeometry(0.08, 16);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9999, transparent: true, opacity: 0.4 });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.35, -0.08, 0.54);
    characterGroup.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.35, -0.08, 0.54);
    characterGroup.add(rightBlush);

    // Mouth Group (dynamic lip-sync mesh)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.25, 0.56);
    characterGroup.add(mouthGroup);

    // Upper Lip
    const lipGeo = new THREE.TorusGeometry(0.1, 0.02, 12, 24, Math.PI);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const upperLip = new THREE.Mesh(lipGeo, lipMat);
    upperLip.rotation.z = Math.PI;
    mouthGroup.add(upperLip);

    // Inner Mouth Cavity
    const innerMouthGeo = new THREE.SphereGeometry(0.09, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const innerMouthMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
    const innerMouth = new THREE.Mesh(innerMouthGeo, innerMouthMat);
    innerMouth.rotation.x = Math.PI * 0.5;
    innerMouth.scale.set(1, 0.3, 0.8);
    mouthGroup.add(innerMouth);

    // Accessories
    if (theme.accessory === 'cap') {
      const capBaseGeo = new THREE.BoxGeometry(0.9, 0.04, 0.9);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x312e81 });
      const capBase = new THREE.Mesh(capBaseGeo, capMat);
      capBase.position.set(0, 0.85, 0);
      capBase.rotation.y = Math.PI / 4;
      characterGroup.add(capBase);

      const capDomeGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.25, 24);
      const capDome = new THREE.Mesh(capDomeGeo, capMat);
      capDome.position.set(0, 0.72, 0);
      characterGroup.add(capDome);
    } else if (theme.accessory === 'glasses') {
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 });
      const rimGeo = new THREE.TorusGeometry(0.14, 0.015, 12, 24);
      const leftRim = new THREE.Mesh(rimGeo, frameMat);
      leftRim.position.set(-0.22, 0.1, 0.62);
      characterGroup.add(leftRim);
      const rightRim = new THREE.Mesh(rimGeo, frameMat);
      rightRim.position.set(0.22, 0.1, 0.62);
      characterGroup.add(rightRim);
      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.16);
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.1, 0.62);
      characterGroup.add(bridge);
    }

    // Animation Loop Variables
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkInterval = 2.5 + Math.random() * 2;
    let isBlinking = false;
    let blinkProgress = 0;

    // Render loop with dynamic lip sync
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();
      const currentStatus = statusRef.current;

      // 1. Idle Breathing & Head sway
      characterGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.03;
      characterGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.06;
      characterGroup.rotation.z = Math.sin(elapsedTime * 0.6) * 0.02;

      // 2. Listening State (Attentive head tilt)
      if (currentStatus === 'listening') {
        characterGroup.rotation.z = 0.08;
        characterGroup.rotation.x = -0.04;
        fillLight.intensity = 1.2;
      } else {
        characterGroup.rotation.x = 0;
        fillLight.intensity = 0.6;
      }

      // 3. Dynamic Lip Sync (Speech-reactive viseme modulation)
      if (currentStatus === 'speaking') {
        // Multi-frequency speech wave synthesis for realistic syllable mouth movement
        const wave1 = Math.sin(elapsedTime * 14);
        const wave2 = Math.cos(elapsedTime * 22);
        const wave3 = Math.sin(elapsedTime * 8);
        const speechIntensity = Math.max(0, (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + 0.5));
        
        // Open/Close jaw and inner cavity
        const targetScaleY = 0.3 + speechIntensity * 1.8;
        const targetScaleX = 1.0 + (Math.sin(elapsedTime * 10) * 0.25);
        
        mouthGroup.scale.y = THREE.MathUtils.lerp(mouthGroup.scale.y, targetScaleY, 0.35);
        mouthGroup.scale.x = THREE.MathUtils.lerp(mouthGroup.scale.x, targetScaleX, 0.35);
        
        // Head subtle nodding while speaking
        characterGroup.position.y += Math.sin(elapsedTime * 8) * 0.02;
        characterGroup.rotation.x = Math.sin(elapsedTime * 6) * 0.04;
      } else {
        // Return mouth to closed smiling posture
        mouthGroup.scale.y = THREE.MathUtils.lerp(mouthGroup.scale.y, 0.2, 0.2);
        mouthGroup.scale.x = THREE.MathUtils.lerp(mouthGroup.scale.x, 1.0, 0.2);
      }

      // 4. Natural Blinking mechanism
      blinkTimer += 0.016;
      if (blinkTimer >= nextBlinkInterval && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
        blinkTimer = 0;
        nextBlinkInterval = 2.5 + Math.random() * 3;
      }

      if (isBlinking) {
        blinkProgress += 0.12;
        const blinkAmount = Math.sin(blinkProgress * Math.PI);
        leftEyelid.scale.y = THREE.MathUtils.lerp(0.01, 1.0, blinkAmount);
        rightEyelid.scale.y = THREE.MathUtils.lerp(0.01, 1.0, blinkAmount);

        if (blinkProgress >= 1) {
          isBlinking = false;
          leftEyelid.scale.y = 0.01;
          rightEyelid.scale.y = 0.01;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 140;
      const h = container.clientHeight || 140;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [role]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '120px',
        height: '120px',
        margin: '0 auto',
        position: 'relative',
      }}
    />
  );
}
