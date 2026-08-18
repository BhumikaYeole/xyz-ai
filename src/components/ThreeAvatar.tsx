'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { VoiceStatus } from '@/lib/use-voice';

interface ThreeAvatarProps {
  role: string;
  voiceStatus: VoiceStatus;
}

function createContinuousHeadGeometry() {
  const geometry = new THREE.SphereGeometry(0.6, 40, 32);
  geometry.scale(1.03, 1.08, 0.9);

  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);

    const normalizedY = vertex.y / 0.648;
    const lowerFace = THREE.MathUtils.clamp(
      (-normalizedY + 0.05) / 1.05,
      0,
      1,
    );

    vertex.x *= 1 - lowerFace * 0.08;

    const chinHeight = THREE.MathUtils.clamp(
      (-normalizedY - 0.22) / 0.55,
      0,
      1,
    );
    const centeredChin = 1 - THREE.MathUtils.clamp(Math.abs(vertex.x) / 0.34, 0, 1);
    vertex.z += chinHeight * centeredChin * 0.025;

    const cheekHeight = Math.exp(-Math.pow((normalizedY - 0.02) / 0.52, 2));
    const cheekSide = THREE.MathUtils.clamp(1 - Math.abs(vertex.x) / 0.54, 0, 1);
    vertex.z += cheekHeight * cheekSide * 0.012;

    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export default function ThreeAvatar({ voiceStatus }: ThreeAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(voiceStatus);
  statusRef.current = voiceStatus;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 140;
    const height = container.clientHeight || 140;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.06, 2.85);
    camera.lookAt(0, -0.02, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.45);
    keyLight.position.set(1.8, 2.6, 3.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc4b5fd, 0.55);
    fillLight.position.set(-2.0, 1.0, 2.4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x8b5cf6, 0.65);
    rimLight.position.set(0, 2.5, -2.2);
    scene.add(rimLight);

    const headGroup = new THREE.Group();
    scene.add(headGroup);

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf6d0b3,
      roughness: 0.58,
      metalness: 0.02,
    });

    const head = new THREE.Mesh(createContinuousHeadGeometry(), skinMat);
    head.position.set(0, 0.02, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.45, 32),
      skinMat,
    );
    neck.position.set(0, -0.67, -0.12);
    headGroup.add(neck);

    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
    });
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.06, 16, 32, Math.PI * 1.3),
      collarMat,
    );
    collar.position.set(0, -0.82, 0.14);
    collar.rotation.x = Math.PI * 0.45;
    collar.rotation.z = Math.PI * 0.35;
    headGroup.add(collar);

    const tie = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.4, 4),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.32,
        metalness: 0.08,
      }),
    );
    tie.position.set(0, -1.01, 0.28);
    tie.rotation.x = 0.1;
    headGroup.add(tie);

    const shoulders = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.85, 0.65, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.64 }),
    );
    shoulders.position.set(0, -1.18, 0);
    headGroup.add(shoulders);

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1a1512,
      roughness: 0.86,
    });

    const topHairGeo = new THREE.SphereGeometry(
      0.6,
      40,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    );
    topHairGeo.scale(1.0, 1.08, 1.0);
    const topHair = new THREE.Mesh(topHairGeo, hairMat);
    topHair.position.set(0, 0.23, -0.015);
    headGroup.add(topHair);

    const quiffGeo = new THREE.SphereGeometry(0.34, 28, 18);
    quiffGeo.scale(1.45, 0.48, 0.82);
    const quiff = new THREE.Mesh(quiffGeo, hairMat);
    quiff.position.set(0, 0.58, 0.29);
    quiff.rotation.x = -0.16;
    headGroup.add(quiff);

    const browMat = new THREE.MeshStandardMaterial({
      color: 0x1f1915,
      roughness: 0.9,
    });
    const browGeo = new THREE.CapsuleGeometry(0.025, 0.17, 6, 12);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.215, 0.195, 0.565);
    leftBrow.rotation.z = Math.PI / 2 - 0.08;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.215, 0.195, 0.565);
    rightBrow.rotation.z = Math.PI / 2 + 0.08;
    headGroup.add(rightBrow);

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0x211b1a,
      roughness: 0.82,
    });
    const eyeGeo = new THREE.SphereGeometry(0.095, 24, 18);
    eyeGeo.scale(1.15, 0.72, 0.38);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.21, 0.065, 0.555);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.21, 0.065, 0.555);
    headGroup.add(rightEye);

    const eyelidGeo = new THREE.SphereGeometry(
      0.105,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    );
    const eyelidMat = new THREE.MeshStandardMaterial({
      color: 0xf6d0b3,
      roughness: 0.6,
    });

    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.position.set(-0.21, 0.105, 0.59);
    leftEyelid.rotation.x = -Math.PI * 0.5;
    leftEyelid.scale.y = 0.01;
    headGroup.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    rightEyelid.position.set(0.21, 0.105, 0.59);
    rightEyelid.rotation.x = -Math.PI * 0.5;
    rightEyelid.scale.y = 0.01;
    headGroup.add(rightEyelid);

    const noseBridge = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 24, 20),
      skinMat,
    );
    noseBridge.scale.set(0.48, 1.1, 0.52);
    noseBridge.position.set(0, -0.10, 0.55);
    headGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 24, 20),
      skinMat,
    );
    noseTip.scale.set(0.88, 0.62, 0.68);
    noseTip.position.set(0, -0.19, 0.60);
    headGroup.add(noseTip);

    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.285, 0.555);
    headGroup.add(mouthGroup);

    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xba7a6f,
      roughness: 0.66,
      transparent: true,
      opacity: 0,
    });

    const upperLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.085, 0.018, 10, 20, Math.PI),
      lipMat,
    );
    upperLip.rotation.z = Math.PI;
    mouthGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.078, 0.019, 10, 20, Math.PI),
      lipMat,
    );
    lowerLip.position.set(0, -0.04, 0.002);
    mouthGroup.add(lowerLip);

    const cavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({
        color: 0x380a0a,
        transparent: true,
        opacity: 0,
      }),
    );
    cavity.rotation.x = Math.PI * 0.5;
    cavity.scale.set(1, 0.35, 0.7);
    mouthGroup.add(cavity);

    const smileGroup = new THREE.Group();
    smileGroup.position.copy(mouthGroup.position);
    headGroup.add(smileGroup);

    const smileMat = new THREE.MeshStandardMaterial({
      color: 0xba7a6f,
      roughness: 0.66,
      transparent: true,
      opacity: 1,
    });
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.105, 0.012, 0.006),
      new THREE.Vector3(0, -0.052, 0.006),
      new THREE.Vector3(0.105, 0.012, 0.006),
    );
    smileGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(smileCurve, 24, 0.019, 8, false),
        smileMat,
      ),
    );

    const cornerGeo = new THREE.SphereGeometry(0.017, 8, 8);
    const leftCorner = new THREE.Mesh(cornerGeo, smileMat);
    leftCorner.position.set(-0.105, 0.016, 0.006);
    smileGroup.add(leftCorner);

    const rightCorner = new THREE.Mesh(cornerGeo, smileMat);
    rightCorner.position.set(0.105, 0.016, 0.006);
    smileGroup.add(rightCorner);

    let animationFrameId = 0;
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkInterval = 3 + Math.random() * 2;
    let isBlinking = false;
    let blinkProgress = 0;
    let mouthBlend = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentStatus = statusRef.current;
      const isSpeaking = currentStatus === 'speaking';

      headGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.018;
      headGroup.rotation.y = Math.sin(elapsedTime * 0.9) * 0.04;
      headGroup.rotation.z =
        currentStatus === 'listening'
          ? 0.05
          : Math.sin(elapsedTime * 0.7) * 0.012;
      headGroup.rotation.x =
        currentStatus === 'listening'
          ? -0.04
          : isSpeaking
            ? Math.sin(elapsedTime * 7) * 0.02
            : 0;
      fillLight.intensity = currentStatus === 'listening' ? 0.85 : 0.55;

      mouthBlend = THREE.MathUtils.lerp(mouthBlend, isSpeaking ? 1 : 0, 0.12);
      lipMat.opacity = mouthBlend;
      cavity.material.opacity = mouthBlend;
      smileMat.opacity = 1 - mouthBlend;
      mouthGroup.visible = mouthBlend > 0.01;
      smileGroup.visible = mouthBlend < 0.99;

      if (isSpeaking) {
        const wave1 = Math.sin(elapsedTime * 16);
        const wave2 = Math.cos(elapsedTime * 24);
        const wave3 = Math.sin(elapsedTime * 10);
        const speechIntensity = Math.max(
          0,
          wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + 0.45,
        );
        const targetScaleY = 0.35 + speechIntensity * 1.5;
        const targetScaleX = 1 + Math.sin(elapsedTime * 12) * 0.14;
        mouthGroup.scale.y = THREE.MathUtils.lerp(
          mouthGroup.scale.y,
          targetScaleY,
          0.4,
        );
        mouthGroup.scale.x = THREE.MathUtils.lerp(
          mouthGroup.scale.x,
          targetScaleX,
          0.4,
        );
      } else {
        mouthGroup.scale.y = THREE.MathUtils.lerp(mouthGroup.scale.y, 0.18, 0.2);
        mouthGroup.scale.x = THREE.MathUtils.lerp(mouthGroup.scale.x, 1, 0.2);
      }

      blinkTimer += 0.016;
      if (blinkTimer >= nextBlinkInterval && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
        blinkTimer = 0;
        nextBlinkInterval = 2.5 + Math.random() * 3.5;
      }

      if (isBlinking) {
        blinkProgress += 0.14;
        const blinkAmount = Math.sin(blinkProgress * Math.PI);
        leftEyelid.scale.y = THREE.MathUtils.lerp(0.01, 1, blinkAmount);
        rightEyelid.scale.y = THREE.MathUtils.lerp(0.01, 1, blinkAmount);

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

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });

      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '124px',
        height: '124px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="3D male avatar"
      role="img"
    />
  );
}
