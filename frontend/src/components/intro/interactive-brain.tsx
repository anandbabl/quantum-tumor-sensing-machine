"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getAnatomicalBrainData } from "./brain-geometry-data";

interface InteractiveBrainProps {
  onStartBloom: () => void;
  onBloomPeak: () => void;
  onComplete: () => void;
}

export default function InteractiveBrain({
  onStartBloom,
  onBloomPeak,
  onComplete,
}: InteractiveBrainProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // Showcase lateral 3/4 perspective matching the reference image
    camera.position.set(0, 0.1, 7.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Dual Accent Lights (Violet & Amber)
    const ambientLight = new THREE.AmbientLight(0x181028, 1.3);
    scene.add(ambientLight);

    const topAmberLight = new THREE.PointLight(0xfacc15, 4.5, 30);
    topAmberLight.position.set(2, 5, 4);
    scene.add(topAmberLight);

    const violetRimLight = new THREE.PointLight(0x8052ff, 4.2, 30);
    violetRimLight.position.set(-4, -2, 4);
    scene.add(violetRimLight);

    // 3. Custom GLSL Shader for Hollow Equilateral Triangles with Arbitrary Rotations
    const vertexShader = `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAngle;
      
      varying vec3 vColor;
      varying float vAngle;

      void main() {
        vColor = aColor;
        vAngle = aAngle;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (330.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAngle;
      uniform float uOpacity;

      // 2D Equilateral Triangle Signed Distance Function
      float sdEquilateralTriangle(in vec2 p, in float r) {
        const float k = 1.7320508;
        p.x = abs(p.x) - r;
        p.y = p.y + r / k;
        if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
        p.x -= clamp(p.x, -2.0 * r, 0.0);
        return -length(p) * sign(p.y);
      }

      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        
        // Individual particle 2D rotation
        float s = sin(vAngle);
        float c = cos(vAngle);
        p = mat2(c, -s, s, c) * p;

        float d = sdEquilateralTriangle(p, 0.38);

        // Hollow triangle stroke
        float distFromStroke = abs(d);
        float stroke = smoothstep(0.065, 0.022, distFromStroke);

        // Translucent inner fill
        float innerFill = (d < 0.0) ? 0.08 : 0.0;
        float alpha = clamp(stroke + innerFill, 0.0, 1.0) * uOpacity;

        vec3 finalColor = vColor;
        if (length(vColor) < 0.05) {
          finalColor = vec3(0.06, 0.06, 0.09);
        }

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // 4. Load Authentic Anatomical 3D Brain Point Cloud (Extracted from 65 segmented brain structures)
    const brainData = getAnatomicalBrainData();
    const totalCount = brainData.count;

    // Copy positions to mutable Float32Array for physics animation
    const posArray = new Float32Array(brainData.positions);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < totalCount; i++) {
      const px = posArray[i * 3];
      const py = posArray[i * 3 + 1];
      const pz = posArray[i * 3 + 2];

      const vel = new THREE.Vector3(px, py, pz).normalize().multiplyScalar(2.2 + Math.random() * 3.4);
      vel.x += (Math.random() - 0.5) * 1.2;
      vel.y += (Math.random() - 0.5) * 1.2;
      vel.z += (Math.random() - 0.5) * 1.2;
      velocities.push(vel);
    }

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute("aColor", new THREE.BufferAttribute(brainData.colors, 3));
    particlesGeo.setAttribute("aSize", new THREE.BufferAttribute(brainData.sizes, 1));
    particlesGeo.setAttribute("aAngle", new THREE.BufferAttribute(brainData.angles, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.96 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesSystem = new THREE.Points(particlesGeo, particlesMaterial);
    brainGroup.add(particlesSystem);

    // 5. Invisible Hit-Test Mesh for Smooth Raycasting
    const hitGeo = new THREE.IcosahedronGeometry(2.35, 3);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.scale.set(1.15, 1.05, 1.28);
    brainGroup.add(hitMesh);

    // 6. Floating Wireframe Background Triangles (Signature Brand Geometry from Reference)
    const floatingTrianglesGroup = new THREE.Group();
    scene.add(floatingTrianglesGroup);

    interface FloatingTriangleData {
      mesh: THREE.LineLoop;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatSpeed: number;
      floatPhase: number;
    }

    const floatingTriangles: FloatingTriangleData[] = [];

    const triangleConfigs = [
      { pos: new THREE.Vector3(-3.4, 1.4, 0.5), scale: 0.75, color: 0xfacc15 }, // Golden amber triangle (upper-left)
      { pos: new THREE.Vector3(-3.8, -0.6, 1.1), scale: 0.95, color: 0xf59e0b }, // Large amber triangle (mid-left)
      { pos: new THREE.Vector3(-2.8, -1.8, 0.4), scale: 0.5, color: 0xa855f7 }, // Purple triangle (lower-left)
      { pos: new THREE.Vector3(3.2, -1.2, 0.8), scale: 0.65, color: 0xffffff }, // White/silver triangle (lower-right)
      { pos: new THREE.Vector3(3.6, 0.4, 0.6), scale: 0.55, color: 0x06b6d4 }, // Cyan triangle (mid-right)
      { pos: new THREE.Vector3(0.6, 3.2, -0.7), scale: 0.45, color: 0xfacc15 }, // Gold triangle (top-center)
      { pos: new THREE.Vector3(-1.5, 2.7, 0.2), scale: 0.38, color: 0x10b981 }, // Green spark triangle (top-left)
    ];

    triangleConfigs.forEach((cfg) => {
      const triGeo = new THREE.BufferGeometry();
      const h = 1.0 * 1.73205;
      const pts = [
        new THREE.Vector3(0, (h * 2) / 3, 0),
        new THREE.Vector3(1.0, -h / 3, 0),
        new THREE.Vector3(-1.0, -h / 3, 0),
      ];
      triGeo.setFromPoints(pts);

      const triMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
      });

      const lineLoop = new THREE.LineLoop(triGeo, triMat);
      lineLoop.position.copy(cfg.pos);
      lineLoop.scale.set(cfg.scale, cfg.scale, cfg.scale);
      floatingTrianglesGroup.add(lineLoop);

      floatingTriangles.push({
        mesh: lineLoop,
        basePos: cfg.pos.clone(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.9,
          (Math.random() - 0.5) * 0.9,
          (Math.random() - 0.5) * 0.9
        ),
        floatSpeed: 0.7 + Math.random() * 0.8,
        floatPhase: Math.random() * Math.PI * 2,
      });
    });

    // 7. Ambient Micro-Triangular Void Sparks (400 tiny floating triangles)
    const ambientCount = 450;
    const ambPos: number[] = [];
    const ambCol: number[] = [];
    const ambSizes: number[] = [];
    const ambAngles: number[] = [];

    const C_AMBER = new THREE.Color("#fbbf24");
    const C_PURPLE = new THREE.Color("#a855f7");
    const C_NEON_GREEN = new THREE.Color("#22c55e");
    const C_WHITE = new THREE.Color("#ffffff");

    for (let i = 0; i < ambientCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 2.8 + Math.random() * 5.2;

      ambPos.push(rad * Math.sin(phi) * Math.cos(theta), rad * Math.sin(phi) * Math.sin(theta), rad * Math.cos(phi));

      const rVal = Math.random();
      const ac = rVal < 0.4 ? C_AMBER : rVal < 0.7 ? C_PURPLE : rVal < 0.9 ? C_NEON_GREEN : C_WHITE;
      ambCol.push(ac.r, ac.g, ac.b);
      ambSizes.push(0.25 + Math.random() * 0.2);
      ambAngles.push(Math.random() * Math.PI * 2);
    }

    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute("position", new THREE.Float32BufferAttribute(ambPos, 3));
    ambGeo.setAttribute("aColor", new THREE.Float32BufferAttribute(ambCol, 3));
    ambGeo.setAttribute("aSize", new THREE.Float32BufferAttribute(ambSizes, 1));
    ambGeo.setAttribute("aAngle", new THREE.Float32BufferAttribute(ambAngles, 1));

    const ambMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.55 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ambientSystem = new THREE.Points(ambGeo, ambMaterial);
    scene.add(ambientSystem);

    // Initial 3/4 lateral perspective angle showing anatomical contours
    brainGroup.rotation.y = 0.55;
    brainGroup.rotation.x = 0.08;

    // 8. Interactive Mouse Movement & Raycasting
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / width) * 2 - 1;
      mouse.targetY = -(e.clientY / height) * 2 + 1;

      mouseVector.x = mouse.targetX;
      mouseVector.y = mouse.targetY;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObject(hitMesh);
      const hovering = intersects.length > 0;
      setIsHovered(hovering);
      container.style.cursor = hovering ? "pointer" : "default";
    };

    window.addEventListener("mousemove", onMouseMove);

    // 9. Bloom Sequence Logic
    let bloomState: "idle" | "pulse" | "expanding" | "peaked" | "complete" = "idle";
    let bloomStartTime = 0;

    const triggerBloom = () => {
      if (bloomState !== "idle") return;
      bloomState = "pulse";
      bloomStartTime = performance.now();
      setHasClicked(true);
      onStartBloom();
    };

    const onClick = () => {
      triggerBloom();
    };

    container.addEventListener("click", onClick);

    // 10. Responsive Window Resize
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    // 11. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const rotSpeed = 0.42 * delta;

      // Animate floating decorative wireframe triangles
      floatingTriangles.forEach((ft) => {
        ft.mesh.rotation.x += ft.rotSpeed.x * delta;
        ft.mesh.rotation.y += ft.rotSpeed.y * delta;
        ft.mesh.rotation.z += ft.rotSpeed.z * delta;
        ft.mesh.position.y = ft.basePos.y + Math.sin(elapsed * ft.floatSpeed + ft.floatPhase) * 0.16;
      });

      if (bloomState === "idle") {
        // Continuous 3D vertical rotation with harmonic precession
        brainGroup.rotation.y += rotSpeed;
        brainGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.06 + mouse.y * 0.22;
        brainGroup.rotation.z = Math.cos(elapsed * 0.35) * 0.04 - mouse.x * 0.18;

        // Subtle organic constellation breathing
        const breathe = 1.0 + Math.sin(elapsed * 2.2) * 0.012;
        particlesSystem.scale.set(breathe, breathe, breathe);

        ambientSystem.rotation.y += rotSpeed * 0.2;
      } else if (bloomState === "pulse") {
        // Phase 1 — Energy pulse surge
        const progress = (performance.now() - bloomStartTime) / 450;
        brainGroup.rotation.y += rotSpeed * 3.5;

        topAmberLight.intensity = THREE.MathUtils.lerp(4.5, 10.0, Math.sin(progress * Math.PI));
        violetRimLight.intensity = THREE.MathUtils.lerp(4.2, 9.0, Math.sin(progress * Math.PI));

        if (progress >= 1.0) {
          bloomState = "expanding";
          bloomStartTime = performance.now();
        }
      } else if (bloomState === "expanding") {
        // Phase 2 — Radial Particle Explosion / Shatter
        const expandTime = (performance.now() - bloomStartTime) / 1000;
        const currentPositions = particlesGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < totalCount; i++) {
          const idx = i * 3;
          const vel = velocities[i];

          currentPositions[idx] += vel.x * delta * 2.2;
          currentPositions[idx + 1] += vel.y * delta * 2.2;
          currentPositions[idx + 2] += vel.z * delta * 2.2;

          vel.multiplyScalar(0.965);
        }

        particlesGeo.attributes.position.needsUpdate = true;

        // Scatter floating wireframe triangles outward
        floatingTriangles.forEach((ft) => {
          ft.mesh.position.addScaledVector(ft.basePos.clone().normalize(), delta * 3.2);
          const mat = ft.mesh.material as THREE.LineBasicMaterial;
          mat.opacity = Math.max(0, 0.72 * (1.0 - expandTime * 0.5));
        });

        if (expandTime >= 2.2 && bloomState === "expanding") {
          bloomState = "peaked";
          onBloomPeak();
        }

        if (expandTime >= 5.2 && bloomState === "peaked") {
          bloomState = "complete";
          onComplete();
        }
      } else if (bloomState === "peaked") {
        const totalTime = (performance.now() - bloomStartTime) / 1000;
        const currentPositions = particlesGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < totalCount; i++) {
          const idx = i * 3;
          const vel = velocities[i];
          currentPositions[idx] += vel.x * delta * 0.7;
          currentPositions[idx + 1] += vel.y * delta * 0.7;
          currentPositions[idx + 2] += vel.z * delta * 0.7;
          vel.multiplyScalar(0.97);
        }
        particlesGeo.attributes.position.needsUpdate = true;

        if (totalTime > 3.6) {
          particlesMaterial.uniforms.uOpacity.value = Math.max(0, 0.96 * (1.0 - (totalTime - 3.6) * 0.7));
          ambMaterial.uniforms.uOpacity.value = Math.max(0, 0.55 * (1.0 - (totalTime - 3.6) * 0.7));
        }

        if (totalTime >= 5.5) {
          bloomState = "complete";
          onComplete();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("click", onClick);

      particlesGeo.dispose();
      particlesMaterial.dispose();
      hitGeo.dispose();
      hitMat.dispose();
      ambGeo.dispose();
      ambMaterial.dispose();

      floatingTriangles.forEach((ft) => {
        ft.mesh.geometry.dispose();
        (ft.mesh.material as THREE.Material).dispose();
      });

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onStartBloom, onBloomPeak, onComplete]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full bg-[#000000] overflow-hidden select-none"
    >
      {/* Subtle interaction cue */}
      {!hasClicked && (
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-500 ${
            isHovered ? "opacity-95" : "opacity-40"
          }`}
        >
          <span className="text-[12px] font-mono uppercase tracking-[0.28em] text-[#facc15] block">
            CLICK 3D BRAIN TO SENSE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] mx-auto mt-2 block animate-ping" />
        </div>
      )}
    </div>
  );
}
