'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface RouteProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function Route({ size = 20, className, ...props }: RouteProps) {
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
      {/* Start node */}
      <motion.circle
        cx="6"
        cy="19"
        r="3"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '6px 19px' }}
      />

      {/* Animated route path */}
      <motion.path
        d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
        initial={{ pathLength: 0.25, pathOffset: 0 }}
        animate={{
          pathLength: [0.25, 0.95, 0.25],
          pathOffset: [0, 0.75, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Destination node */}
      <motion.circle
        cx="18"
        cy="5"
        r="3"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.1,
        }}
        style={{ transformOrigin: '18px 5px' }}
      />
    </motion.svg>
  );
}

export { Route as RouteIcon };
