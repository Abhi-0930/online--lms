"use client";

import React, { useEffect, useRef } from "react";

export function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes
    const nodeCount = 45;
    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      color: string;
    }> = [];

    const colors = [
      "rgba(49, 87, 232, ",   // Primary Blue
      "rgba(99, 102, 241, ",  // Indigo
      "rgba(14, 165, 233, ",  // Sky
      "rgba(168, 85, 247, ",  // Purple
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 0.9,
        y: (Math.random() - 0.5) * height * 0.9,
        z: Math.random() * 400 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = (e.clientX - rect.left - width / 2) * 0.05;
      targetY = (e.clientY - rect.top - height / 2) * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      angle += 0.003;

      const fov = 350;
      const cx = width / 2 + mouseX;
      const cy = height / 2 + mouseY;

      // Project 3D to 2D
      const projected: Array<{ x: number; y: number; scale: number; alpha: number; color: string; radius: number }> = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Bounce within 3D bounding box
        if (Math.abs(node.x) > width * 0.45) node.vx *= -1;
        if (Math.abs(node.y) > height * 0.45) node.vy *= -1;
        if (node.z < 80 || node.z > 500) node.vz *= -1;

        // Rotate along Y axis
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const rx = node.x * cosA - node.z * sinA * 0.3;
        const rz = node.z * cosA + node.x * sinA * 0.3 + 300;

        const scale = fov / (fov + rz);
        const px = rx * scale + cx;
        const py = node.y * scale + cy;
        const alpha = Math.min(Math.max((1 - rz / 700) * 0.8, 0.15), 0.9);

        projected.push({
          x: px,
          y: py,
          scale,
          alpha,
          color: node.color,
          radius: node.radius * scale,
        });
      }

      // Draw connecting lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.15 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(49, 87, 232, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes with soft glow
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 1), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Subtle outer aura
        if (p.radius > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * 0.2})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-65"
      />
    </div>
  );
}
