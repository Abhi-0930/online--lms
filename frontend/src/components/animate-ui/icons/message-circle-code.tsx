'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface MessageCircleCodeProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function MessageCircleCode({
  size = 20,
  className,
  isHovered,
  ...props
}: MessageCircleCodeProps) {
  const [localHover, setLocalHover] = React.useState(false);
  const active = isHovered !== undefined ? isHovered : localHover;

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
      onMouseEnter={(e) => {
        setLocalHover(true);
        if (typeof props.onMouseEnter === 'function') {
          (props.onMouseEnter as any)(e);
        }
      }}
      onMouseLeave={(e) => {
        setLocalHover(false);
        if (typeof props.onMouseLeave === 'function') {
          (props.onMouseLeave as any)(e);
        }
      }}
    >
      {/* Chat bubble body with gentle wobble/pulse */}
      <motion.path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        animate={
          active
            ? {
                scale: [1, 1.05, 1],
                rotate: [0, 4, -4, 0],
              }
            : { scale: 1, rotate: 0 }
        }
        transition={
          active
            ? {
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Left angle code bracket < */}
      <motion.path
        d="M10 9.5 8 12l2 2.5"
        animate={
          active
            ? {
                x: [0, -2.5, 0],
              }
            : { x: 0 }
        }
        transition={
          active
            ? {
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
      />

      {/* Right angle code bracket > */}
      <motion.path
        d="m14 9.5 2 2.5-2 2.5"
        animate={
          active
            ? {
                x: [0, 2.5, 0],
              }
            : { x: 0 }
        }
        transition={
          active
            ? {
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
      />
    </motion.svg>
  );
}

export { MessageCircleCode as MessageCircleCodeIcon };
