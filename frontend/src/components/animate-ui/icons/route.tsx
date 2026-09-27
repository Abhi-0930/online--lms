'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface RouteProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function Route({
  size = 20,
  className,
  isHovered,
  ...props
}: RouteProps) {
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
      {/* Start node */}
      <motion.circle
        cx="6"
        cy="19"
        r="3"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={
          active
            ? {
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }
            : { scale: 1, opacity: 0.8 }
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
        style={{ transformOrigin: '6px 19px' }}
      />

      {/* Animated route path */}
      <motion.path
        d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
        initial={{ pathLength: 1, pathOffset: 0 }}
        animate={
          active
            ? {
                pathLength: [0.25, 0.95, 0.25],
                pathOffset: [0, 0.75, 0],
              }
            : { pathLength: 1, pathOffset: 0 }
        }
        transition={
          active
            ? {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
      />

      {/* Destination node */}
      <motion.circle
        cx="18"
        cy="5"
        r="3"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={
          active
            ? {
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }
            : { scale: 1, opacity: 0.8 }
        }
        transition={
          active
            ? {
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.1,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '18px 5px' }}
      />
    </motion.svg>
  );
}

export { Route as RouteIcon };
