"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Terminal, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export function LayerRevealCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealPercentage, setRevealPercentage] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create offscreen mask canvas for smooth brush painting
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    let animationFrameId: number;
    let width = (canvas.width = maskCanvas.width = container.clientWidth);
    let height = (canvas.height = maskCanvas.height = container.clientHeight);

    const handleResize = () => {
      if (!container) return;
      width = canvas.width = maskCanvas.width = container.clientWidth;
      height = canvas.height = maskCanvas.height = container.clientHeight;
      drawBaseLayer();
    };

    window.addEventListener("resize", handleResize);

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let isHovered = false;
    let paintedPixels = 0;

    // Initialize mask canvas background as black (concealed)
    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, width, height);

    // Initial reveal hint in the center
    const initialGrad = maskCtx.createRadialGradient(
      width * 0.45,
      height * 0.5,
      10,
      width * 0.45,
      height * 0.5,
      140
    );
    initialGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    initialGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    maskCtx.fillStyle = initialGrad;
    maskCtx.beginPath();
    maskCtx.arc(width * 0.45, height * 0.5, 140, 0, Math.PI * 2);
    maskCtx.fill();

    // Floating glowing particles on the revealed layer
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovered = true;

      // Paint reveal mask with soft radial brush
      maskCtx.save();
      const brushSize = 95;
      const brushGrad = maskCtx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        brushSize
      );
      brushGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      brushGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.65)");
      brushGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      maskCtx.fillStyle = brushGrad;
      maskCtx.beginPath();
      maskCtx.arc(mouseX, mouseY, brushSize, 0, Math.PI * 2);
      maskCtx.fill();

      // Connect line between previous and current mouse to avoid gaps during fast movement
      maskCtx.beginPath();
      maskCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      maskCtx.lineWidth = brushSize * 1.4;
      maskCtx.lineCap = "round";
      maskCtx.moveTo(prevMouseX, prevMouseY);
      maskCtx.lineTo(mouseX, mouseY);
      maskCtx.stroke();
      maskCtx.restore();

      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Draw the 3D organic branch / layered ribbon
    const drawBaseLayer = () => {
      // 1. Clear main canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Draw Layer 1: The Raw Sculptural Surface (Warm Bark / Graphite Texture)
      const centerY = height * 0.52;
      const curveHeight = 90;

      // Draw sculptural curved wood / ribbon spine
      ctx.save();
      const baseGrad = ctx.createLinearGradient(0, centerY - 100, width, centerY + 100);
      baseGrad.addColorStop(0, "#4a3c31");
      baseGrad.addColorStop(0.3, "#6d594b");
      baseGrad.addColorStop(0.6, "#3d3128");
      baseGrad.addColorStop(1, "#524338");

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(0, centerY - 30);
      ctx.bezierCurveTo(
        width * 0.25,
        centerY - curveHeight,
        width * 0.7,
        centerY + curveHeight * 1.2,
        width,
        centerY - 40
      );
      ctx.lineTo(width, centerY + 60);
      ctx.bezierCurveTo(
        width * 0.75,
        centerY + curveHeight * 1.8,
        width * 0.25,
        centerY + 40,
        0,
        centerY + 80
      );
      ctx.closePath();
      ctx.fill();

      // Add wood grain texture lines
      ctx.strokeStyle = "rgba(20, 15, 10, 0.4)";
      ctx.lineWidth = 1.5;
      for (let i = -40; i <= 60; i += 12) {
        ctx.beginPath();
        ctx.moveTo(0, centerY + i);
        ctx.bezierCurveTo(
          width * 0.3,
          centerY - curveHeight * 0.6 + i,
          width * 0.7,
          centerY + curveHeight * 0.9 + i,
          width,
          centerY + i * 0.8
        );
        ctx.stroke();
      }
      ctx.restore();

      // 3. Draw Layer 2: The Revealed Lush Moss / Cyber Energy Layer (Revealed via Mask)
      // Create temporary canvas for the revealed content
      const revealedCanvas = document.createElement("canvas");
      revealedCanvas.width = width;
      revealedCanvas.height = height;
      const rCtx = revealedCanvas.getContext("2d");
      if (rCtx) {
        // Draw vibrant emerald/lime moss texture & glowing algorithmic circuits
        const mossGrad = rCtx.createLinearGradient(0, centerY - 90, width, centerY + 90);
        mossGrad.addColorStop(0, "#84cc16");   // Lime green
        mossGrad.addColorStop(0.3, "#22c55e"); // Vibrant Emerald
        mossGrad.addColorStop(0.6, "#a3e635"); // Electric Chartreuse
        mossGrad.addColorStop(1, "#10b981");   // Teal-emerald

        rCtx.fillStyle = mossGrad;
        rCtx.beginPath();
        rCtx.moveTo(0, centerY - 35);
        rCtx.bezierCurveTo(
          width * 0.25,
          centerY - curveHeight - 6,
          width * 0.7,
          centerY + curveHeight * 1.25,
          width,
          centerY - 45
        );
        rCtx.lineTo(width, centerY + 68);
        rCtx.bezierCurveTo(
          width * 0.75,
          centerY + curveHeight * 1.9,
          width * 0.25,
          centerY + 48,
          0,
          centerY + 88
        );
        rCtx.closePath();
        rCtx.fill();

        // Add soft moss fur / algorithmic stippling dots
        rCtx.fillStyle = "rgba(190, 242, 100, 0.7)";
        for (let i = 0; i < 300; i++) {
          const t = Math.random();
          const px = t * width;
          const py =
            centerY +
            (Math.sin(t * Math.PI * 2) * curveHeight * 0.8 + (Math.random() - 0.5) * 80);
          rCtx.beginPath();
          rCtx.arc(px, py, Math.random() * 3 + 1, 0, Math.PI * 2);
          rCtx.fill();
        }

        // Draw glowing algorithmic circuit lines over the moss
        rCtx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        rCtx.lineWidth = 2;
        rCtx.beginPath();
        rCtx.moveTo(width * 0.15, centerY);
        rCtx.lineTo(width * 0.35, centerY - 30);
        rCtx.lineTo(width * 0.55, centerY + 40);
        rCtx.lineTo(width * 0.85, centerY - 10);
        rCtx.stroke();

        // Node dots
        const nodes = [
          { x: width * 0.15, y: centerY },
          { x: width * 0.35, y: centerY - 30 },
          { x: width * 0.55, y: centerY + 40 },
          { x: width * 0.85, y: centerY - 10 },
        ];
        nodes.forEach((n) => {
          rCtx.fillStyle = "#ffffff";
          rCtx.beginPath();
          rCtx.arc(n.x, n.y, 5, 0, Math.PI * 2);
          rCtx.fill();
          rCtx.fillStyle = "rgba(132, 204, 22, 0.5)";
          rCtx.beginPath();
          rCtx.arc(n.x, n.y, 11, 0, Math.PI * 2);
          rCtx.fill();
        });

        // 4. Apply Mask using 'destination-in'
        rCtx.globalCompositeOperation = "destination-in";
        rCtx.drawImage(maskCanvas, 0, 0);

        // 5. Draw the masked revealed layer onto main canvas
        ctx.drawImage(revealedCanvas, 0, 0);
      }
    };

    let tick = 0;
    const render = () => {
      tick++;
      drawBaseLayer();

      // Subtle ambient cursor pulse when user hovers
      if (isHovered) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(132, 204, 22, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#a3e635";
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] select-none cursor-crosshair overflow-hidden rounded-3xl"
    >
      {/* Background Soft Serene Ambient Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaf2f8] via-[#f2f7fb] to-white/90 rounded-3xl" />

      {/* Interactive Reveal Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Floating Micro-Badge Top Left: Reveal Instruction */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-md text-[11.5px] font-bold text-slate-700">
        <Sparkles className="w-3.5 h-3.5 text-lime-600 animate-pulse" />
        <span>Hover & glide cursor to uncover deeper mastery</span>
      </div>

      {/* Floating Glass Telemetry Card 1: Top Right */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-lg shadow-slate-900/5 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">Algorithmic Intuition</p>
          <p className="text-[10.5px] text-slate-500 font-mono">14 Patterns · 400+ Problems</p>
        </div>
      </motion.div>

      {/* Floating Glass Telemetry Card 2: Bottom Left */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-lg shadow-slate-900/5 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">Average Placement Spike</p>
          <p className="text-[10.5px] text-emerald-600 font-bold">+168% to +240% CTC Hike</p>
        </div>
      </motion.div>

      {/* Floating Glass Telemetry Card 3: Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-semibold"
      >
        <ShieldCheck className="w-4 h-4 text-lime-400" />
        <span>1:1 FAANG Code Review Included</span>
      </motion.div>
    </div>
  );
}
