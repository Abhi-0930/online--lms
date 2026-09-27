'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface MessageCircleCodeProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function MessageCircleCode({
  size = 20,
  className,
  ...props
}: MessageCircleCodeProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Chat bubble body with gentle wobble/pulse */}
      <motion.path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 4, -4, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Left angle code bracket < */}
      <motion.path
        d="M10 9.5 8 12l2 2.5"
        animate={{
          x: [0, -2.5, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Right angle code bracket > */}
      <motion.path
        d="m14 9.5 2 2.5-2 2.5"
        animate={{
          x: [0, 2.5, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.svg>
  );
}

export { MessageCircleCode as MessageCircleCodeIcon };
