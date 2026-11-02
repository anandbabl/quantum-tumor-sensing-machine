"use client";

import React, { useEffect, useRef } from "react";

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    // Dala / Quantum palette: Violet, Cyan, Electric Purple, Synaptic White
    const colors = ["#8052ff", "#22d3ee", "#a855f7", "#38bdf8", "#c084fc"];
    let particles: AmbientParticle[] = [];

    const initParticles = () => {
      particles = [];
      const count = Math.min(75, Math.floor((width * height) / 18000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2.2 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.35 + 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    initParticles();

    let time = 0;

    const animate = () => {
      if (!ctx) return;
      time += 0.01;

      // Base background: Dark navy void
      ctx.fillStyle = "#03050a";
      ctx.fillRect(0, 0, width, height);

      // Subtle drifting radial light orbs
      // Orb 1: Violet luminary (top right)
      const orb1X = width * 0.75 + Math.sin(time * 0.4) * 60;
      const orb1Y = height * 0.25 + Math.cos(time * 0.3) * 60;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, width * 0.45);
      grad1.addColorStop(0, "rgba(128, 82, 255, 0.08)");
      grad1.addColorStop(0.5, "rgba(128, 82, 255, 0.02)");
      grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Orb 2: Cyan luminary (bottom left)
      const orb2X = width * 0.25 + Math.cos(time * 0.35) * 50;
      const orb2Y = height * 0.75 + Math.sin(time * 0.45) * 50;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, width * 0.4);
      grad2.addColorStop(0, "rgba(34, 211, 238, 0.06)");
      grad2.addColorStop(0.5, "rgba(34, 211, 238, 0.015)");
      grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Subtle quantum lattice points (dot grid) at 4% opacity
      const gridSize = 56;
      ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
      for (let x = gridSize; x < width; x += gridSize) {
        for (let y = gridSize; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Connecting synaptic threads between nearby ambient particles
      const maxConnectDist = 120;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.12;
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Render floating particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around viewport edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(time * 3 + i) * 0.08;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.45, currentAlpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
