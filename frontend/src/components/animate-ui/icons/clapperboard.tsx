'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface ClapperboardProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function Clapperboard({
  size = 20,
  className,
  isHovered,
  ...props
}: ClapperboardProps) {
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
      {/* Top clapping arm hinged at bottom-left corner */}
      <motion.g
        animate={
          active
            ? {
                rotate: [0, -20, 0, 0],
              }
            : { rotate: 0 }
        }
        transition={
          active
            ? {
                duration: 2.2,
                repeat: Infinity,
                times: [0, 0.28, 0.48, 1],
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '3px 11px' }}
      >
        <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
        <path d="m6.2 5.3 3.1 3.9" />
        <path d="m12.4 3.4 3.1 4" />
      </motion.g>

      {/* Clapperboard base body */}
      <motion.path
        d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
        animate={
          active
            ? {
                scale: [1, 0.98, 1.02, 1],
              }
            : { scale: 1 }
        }
        transition={
          active
            ? {
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '12px 16px' }}
      />
    </motion.svg>
  );
}

export { Clapperboard as ClapperboardIcon };
