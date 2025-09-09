"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";

export default function Dolphin({
  modelPath = "/stylized_fish_model.glb",
  scrollProgress = 0,
  startPosition = [0, 0, 0],
  endPosition = [0, 0, 0],
  startRotation = [0, 0, 0],
  endRotation = [0, 0, 0],
  tiltAmount = 0.2,
  positionOverride = null,
  rotationOverride = null,
  onLoadProgress = () => {}, 
  onLoadStatus = () => {}, 
  ...props
}) {
  const group = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const { progress } = useProgress();
  const { scene, animations } = useGLTF(
    modelPath,
    undefined,
    undefined,
    (loader) => {
      loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const calculatedProgress = (itemsLoaded / itemsTotal) * 100;
        onLoadProgress(calculatedProgress);
      };
    }
  );
  const mixer = useRef();

  useEffect(() => {
    if (scene) {
      setIsModelLoaded(true);
      onLoadStatus(true);
    }
  }, [scene, onLoadStatus]);

  useEffect(() => {
    onLoadProgress(progress);
  }, [progress, onLoadProgress]);

  useEffect(() => {
    if (animations.length && isModelLoaded) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => mixer.current.clipAction(clip).play());
    }
  }, [animations, scene, isModelLoaded]);

  useFrame((_, delta) => {
    if (mixer.current) mixer.current.update(delta);
    if (!group.current || !isModelLoaded) return;

    // ---- POSITION ----
    if (positionOverride) {
      const [x, y, z] = positionOverride;
      group.current.position.set(x, y, z);
    } else {
      group.current.position.lerpVectors(
        new THREE.Vector3(...startPosition),
        new THREE.Vector3(...endPosition),
        scrollProgress
      );
    }

    // ---- ROTATION ----
    if (rotationOverride) {
      const [rx, ry, rz] = rotationOverride;
      group.current.rotation.set(rx, ry, rz);
    } else {
      const rotStart = new THREE.Euler(...startRotation);
      const rotEnd = new THREE.Euler(...endRotation);
      group.current.rotation.set(
        THREE.MathUtils.lerp(rotStart.x, rotEnd.x, scrollProgress),
        THREE.MathUtils.lerp(rotStart.y, rotEnd.y, scrollProgress),
        THREE.MathUtils.lerp(rotStart.z, rotEnd.z, scrollProgress)
      );
    }

    group.current.rotation.z += Math.sin(scrollProgress * Math.PI) * tiltAmount;
  });

  return <primitive ref={group} object={scene} {...props} />;
}