'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface MessageCircleMoreProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function MessageCircleMore({
  size = 20,
  className,
  isHovered,
  ...props
}: MessageCircleMoreProps) {
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
      {/* Chat bubble body */}
      <motion.path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        animate={
          active
            ? {
                scale: [1, 1.05, 1],
              }
            : { scale: 1 }
        }
        transition={
          active
            ? {
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Typing dot 1 */}
      <motion.circle
        cx="8"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={
          active
            ? {
                y: [0, -3, 0],
                scale: [1, 1.35, 1],
                opacity: [0.6, 1, 0.6],
              }
            : { y: 0, scale: 1, opacity: 1 }
        }
        transition={
          active
            ? {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '8px 12px' }}
      />

      {/* Typing dot 2 */}
      <motion.circle
        cx="12"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={
          active
            ? {
                y: [0, -3, 0],
                scale: [1, 1.35, 1],
                opacity: [0.6, 1, 0.6],
              }
            : { y: 0, scale: 1, opacity: 1 }
        }
        transition={
          active
            ? {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Typing dot 3 */}
      <motion.circle
        cx="16"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={
          active
            ? {
                y: [0, -3, 0],
                scale: [1, 1.35, 1],
                opacity: [0.6, 1, 0.6],
              }
            : { y: 0, scale: 1, opacity: 1 }
        }
        transition={
          active
            ? {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '16px 12px' }}
      />
    </motion.svg>
  );
}

export { MessageCircleMore as MessageCircleMoreIcon };
