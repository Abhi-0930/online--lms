'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface ClapperboardProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function Clapperboard({
  size = 20,
  className,
  ...props
}: ClapperboardProps) {
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
      {/* Top clapping arm hinged at bottom-left corner */}
      <motion.g
        animate={{
          rotate: [0, -20, 0, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          times: [0, 0.28, 0.48, 1],
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '3px 11px' }}
      >
        <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
        <path d="m6.2 5.3 3.1 3.9" />
        <path d="m12.4 3.4 3.1 4" />
      </motion.g>

      {/* Clapperboard base body */}
      <motion.path
        d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
        animate={{
          scale: [1, 0.98, 1.02, 1],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '12px 16px' }}
      />
    </motion.svg>
  );
}

export { Clapperboard as ClapperboardIcon };
