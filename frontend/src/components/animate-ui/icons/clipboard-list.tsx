'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface ClipboardListProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function ClipboardList({
  size = 20,
  className,
  ...props
}: ClipboardListProps) {
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
      {/* Clip top */}
      <motion.rect
        width="8"
        height="4"
        x="8"
        y="2"
        rx="1"
        ry="1"
        animate={{
          y: [2, 1, 2],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Board outline */}
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />

      {/* Checklist item 1 */}
      <motion.path
        d="M8 11h.01"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '8px 11px' }}
      />
      <motion.path
        d="M12 11h4"
        initial={{ pathLength: 0.2 }}
        animate={{
          pathLength: [0.2, 1, 0.2],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Checklist item 2 */}
      <motion.path
        d="M8 16h.01"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.7,
        }}
        style={{ transformOrigin: '8px 16px' }}
      />
      <motion.path
        d="M12 16h4"
        initial={{ pathLength: 0.2 }}
        animate={{
          pathLength: [0.2, 1, 0.2],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.7,
        }}
      />
    </motion.svg>
  );
}

export { ClipboardList as ClipboardListIcon };
