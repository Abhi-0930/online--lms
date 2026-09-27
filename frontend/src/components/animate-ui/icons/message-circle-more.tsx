'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface MessageCircleMoreProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function MessageCircleMore({
  size = 20,
  className,
  ...props
}: MessageCircleMoreProps) {
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
      {/* Chat bubble body */}
      <motion.path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Typing dot 1 */}
      <motion.circle
        cx="8"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.35, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0,
        }}
        style={{ transformOrigin: '8px 12px' }}
      />

      {/* Typing dot 2 */}
      <motion.circle
        cx="12"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.35, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        style={{ transformOrigin: '12px 12px' }}
      />

      {/* Typing dot 3 */}
      <motion.circle
        cx="16"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.35, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
        style={{ transformOrigin: '16px 12px' }}
      />
    </motion.svg>
  );
}

export { MessageCircleMore as MessageCircleMoreIcon };
