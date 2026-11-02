"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  baseAlpha: number;
  rotation: number;
  vRot: number;
  isAmbient: boolean;
}

export default function NeuralBrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 640);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 640);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    // Mouse coordinates for interactive deflection
    const mouse = { x: width / 2, y: height / 2, radius: 150, isHovering: false };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovering = true;
    };

    const onMouseLeave = () => {
      mouse.isHovering = false;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Quantum Palette: Electric Violet, Quantum Cyan, Deep Purple, Electric Blue, Amber
    const colors = [
      "#8052ff", // Electric Violet
      "#8052ff",
      "#22d3ee", // Quantum Cyan
      "#22d3ee",
      "#a855f7", // Deep Purple
      "#38bdf8", // Sky Electric Blue
      "#ffb829", // Amber Spark
      "#ffffff", // Synaptic Pure White
    ];

    let particles: Particle[] = [];

    // Anatomical 3D brain envelope checking (Cerebral vault, frontal, occipital, temporal, cerebellum, brainstem)
    function isInsideBrain3D(nx: number, ny: number, nz: number): boolean {
      // nx, ny, nz in normalized range [-1, 1]
      // Main cerebral hemispheres
      const rVault = (nx * 1.1) ** 2 + ((ny + 0.12) * 1.25) ** 2 + (nz * 1.2) ** 2;
      if (rVault < 0.65) {
        // Interhemispheric fissure (longitudinal cerebral fissure)
        if (Math.abs(nx) < 0.04 && ny < -0.15) return false;
        // Superior sagittal sinus sulcus
        if (Math.abs(nx) < 0.08 && ny < -0.42) return false;
        return true;
      }

      // Frontal pole / lobe
      const rFrontal = ((nx + 0.36) * 1.35) ** 2 + ((ny + 0.08) * 1.2) ** 2 + (nz * 1.35) ** 2;
      if (rFrontal < 0.38) return true;

      // Occipital lobe
      const rOccipital = ((nx - 0.42) * 1.35) ** 2 + ((ny - 0.04) * 1.3) ** 2 + (nz * 1.4) ** 2;
      if (rOccipital < 0.32) return true;

      // Temporal lobe
      const rTemporal = ((nx + 0.18) * 1.5) ** 2 + ((ny - 0.32) * 1.8) ** 2 + ((nz - 0.28) * 1.4) ** 2;
      if (rTemporal < 0.22) return true;
      const rTemporalR = ((nx + 0.18) * 1.5) ** 2 + ((ny - 0.32) * 1.8) ** 2 + ((nz + 0.28) * 1.4) ** 2;
      if (rTemporalR < 0.22) return true;

      // Cerebellar hemisphere
      const rCerebellum = ((nx - 0.32) * 1.45) ** 2 + ((ny - 0.38) * 1.7) ** 2 + (nz * 1.35) ** 2;
      if (rCerebellum < 0.24) return true;

      // Brainstem / Pons
      if (Math.abs(nx) < 0.12 && Math.abs(nz) < 0.12 && ny > 0.22 && ny < 0.72) return true;

      return false;
    }

    function initParticles() {
      particles = [];
      const coreCount = Math.min(2600, Math.floor((width * height) / 150));
      const ambientCount = 320;
      const scale = Math.min(width, height) * 0.46;

      // 1. Core 3D Brain Constellation
      let generated = 0;
      let attempts = 0;
      while (generated < coreCount && attempts < coreCount * 18) {
        attempts++;
        const nx = (Math.random() - 0.5) * 2;
        const ny = (Math.random() - 0.5) * 2;
        const nz = (Math.random() - 0.5) * 2;

        if (isInsideBrain3D(nx, ny, nz)) {
          const bx = nx * scale + (Math.random() - 0.5) * 8;
          const by = ny * scale + (Math.random() - 0.5) * 8;
          const bz = nz * scale + (Math.random() - 0.5) * 8;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.random() * 2.8 + 1.2;

          particles.push({
            x: bx,
            y: by,
            z: bz,
            baseX: bx,
            baseY: by,
            baseZ: bz,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            vz: (Math.random() - 0.5) * 0.2,
            size,
            color,
            baseAlpha: Math.random() * 0.7 + 0.3,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.025,
            isAmbient: false,
          });
          generated++;
        }
      }

      // 2. Ambient scattered quantum micro-particles across 3D space
      for (let i = 0; i < ambientCount; i++) {
        const ax = (Math.random() - 0.5) * width * 1.3;
        const ay = (Math.random() - 0.5) * height * 1.3;
        const az = (Math.random() - 0.5) * scale * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 2.0 + 0.8;

        particles.push({
          x: ax,
          y: ay,
          z: az,
          baseX: ax,
          baseY: ay,
          baseZ: az,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          size,
          color,
          baseAlpha: Math.random() * 0.35 + 0.08,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.02,
          isAmbient: true,
        });
      }
    }

    initParticles();

    let time = 0;
    const fov = 480;

    // Draw sharp outlined geometric triangle
    function drawOutlinedTriangle(
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.beginPath();
      const h = size * 1.732;
      ctx.moveTo(0, -h * 0.55);
      ctx.lineTo(size, h * 0.45);
      ctx.lineTo(-size, h * 0.45);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!ctx) return;
      time += 0.008;

      // Pure black canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 - 10;

      // Radial volumetric glow: Violet & Cyan
      const ambientGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.55);
      ambientGlow.addColorStop(0, "rgba(128, 82, 255, 0.12)");
      ambientGlow.addColorStop(0.35, "rgba(34, 211, 238, 0.06)");
      ambientGlow.addColorStop(0.7, "rgba(168, 85, 247, 0.03)");
      ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 3D Rotation angles: slow gentle precession
      const rotY = time * 0.35;
      const rotX = Math.sin(time * 0.25) * 0.12;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project particles to 2D screen coordinates with 3D depth
      interface ProjectedParticle {
        px: number;
        py: number;
        pz: number;
        scale: number;
        size: number;
        color: string;
        alpha: number;
        rotation: number;
        isAmbient: boolean;
      }

      const projected: ProjectedParticle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isAmbient) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          const bound = width * 0.7;
          if (p.x < -bound) p.x = bound;
          if (p.x > bound) p.x = -bound;
          if (p.y < -bound) p.y = bound;
          if (p.y > bound) p.y = -bound;
          if (p.z < -bound) p.z = bound;
          if (p.z > bound) p.z = -bound;

          // Simple projection for ambient particles
          const pz = p.z + fov;
          if (pz <= 10) continue;
          const projScale = fov / pz;
          const px = cx + p.x * projScale;
          const py = cy + p.y * projScale;

          p.rotation += p.vRot;
          projected.push({
            px,
            py,
            pz,
            scale: projScale,
            size: p.size * projScale,
            color: p.color,
            alpha: p.baseAlpha * Math.min(1, projScale),
            rotation: p.rotation,
            isAmbient: true,
          });
        } else {
          // 3D Harmonic breathing
          const pulse = Math.sin(time * 2 + (p.baseX + p.baseY) * 0.01) * 3.2;
          const bx = p.baseX + (p.baseX / 100) * pulse;
          const by = p.baseY + (p.baseY / 100) * pulse;
          const bz = p.baseZ + (p.baseZ / 100) * pulse;

          // Apply 3D rotation (Y axis then X axis)
          const x1 = bx * cosY - bz * sinY;
          const z1 = bx * sinY + bz * cosY;
          const y1 = by * cosX - z1 * sinX;
          const z2 = by * sinX + z1 * cosX;

          // Mouse deflection in 3D projection
          let curX = x1;
          let curY = y1;
          const pz = z2 + fov;
          if (pz <= 20) continue;
          const projScale = fov / pz;
          let px = cx + curX * projScale;
          let py = cy + curY * projScale;

          if (mouse.isHovering) {
            const dx = mouse.x - px;
            const dy = mouse.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const force = (1 - dist / mouse.radius) * 36;
              const angle = Math.atan2(dy, dx);
              px -= Math.cos(angle) * force;
              py -= Math.sin(angle) * force;
            }
          }

          p.rotation += p.vRot;
          const depthAlpha = Math.max(0.12, Math.min(1.0, (z2 + 250) / 450)) * p.baseAlpha;

          projected.push({
            px,
            py,
            pz: z2,
            scale: projScale,
            size: Math.max(0.6, p.size * projScale * 1.1),
            color: p.color,
            alpha: depthAlpha,
            rotation: p.rotation,
            isAmbient: false,
          });
        }
      }

      // Sort by depth (painters algorithm) for realistic 3D volumetric appearance
      projected.sort((a, b) => a.pz - b.pz);

      // Synaptic connection threads between nearby constellation particles
      const maxDist = 28;
      for (let i = 0; i < projected.length; i += 7) {
        const p1 = projected[i];
        if (p1.isAmbient) continue;

        for (let j = i + 1; j < Math.min(i + 20, projected.length); j += 2) {
          const p2 = projected[j];
          if (p2.isAmbient) continue;

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.16 * p1.alpha;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Render triangles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        drawOutlinedTriangle(p.px, p.py, p.size, p.rotation, p.color, p.alpha);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[660px] flex items-center justify-center bg-[#000000] select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
      />
      {/* Telemetry Labels floating on void */}
      <div className="absolute top-4 right-4 text-[11px] font-mono tracking-wider text-[#22d3ee] flex items-center gap-2 pointer-events-none bg-black/60 px-3 py-1.5 rounded-full border border-[#22d3ee]/20 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-ping" />
        <span>EFFICIENTNETB3 96.24% ACTIVE</span>
      </div>
      <div className="absolute bottom-6 left-4 text-[11px] font-mono tracking-wider text-[#8052ff] pointer-events-none bg-black/60 px-3 py-1.5 rounded-full border border-[#8052ff]/20 backdrop-blur-md">
        <span>385 LAYERS • 3D QUANTUM CONSTELLATION</span>
      </div>
    </div>
  );
}
