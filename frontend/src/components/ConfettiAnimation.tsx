"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface ConfettiAnimationProps {
  className?: string;
}

export function ConfettiAnimation({ className = "" }: ConfettiAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize DotLottie with local 3.8KB bundle for 0ms instant playback
    const dotLottie = new DotLottie({
      canvas,
      src: "/confetti.lottie",
      loop: true,
      autoplay: true,
      backgroundColor: "transparent",
      renderConfig: {
        autoResize: true,
      },
      layout: {
        fit: "contain",
      },
    });

    dotLottieRef.current = dotLottie;

    return () => {
      try {
        dotLottie.destroy();
      } catch {}
    };
  }, []);

  return (
    <div className={`w-full h-full flex items-center justify-center relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}
