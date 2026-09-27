'use client';

import * as React from 'react';
import { motion, type SVGMotionProps } from 'framer-motion';

export interface ChartNoAxesColumnDecreasingProps
  extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  isHovered?: boolean;
}

export function ChartNoAxesColumnDecreasing({
  size = 20,
  className,
  isHovered,
  ...props
}: ChartNoAxesColumnDecreasingProps) {
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
      {/* Column 1 (tallest, left) */}
      <motion.path
        d="M5 21V3"
        animate={
          active
            ? {
                scaleY: [1, 0.45, 1.15, 1],
              }
            : { scaleY: 1 }
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
        style={{ transformOrigin: '5px 21px' }}
      />

      {/* Column 2 (middle) */}
      <motion.path
        d="M12 21V9"
        animate={
          active
            ? {
                scaleY: [1, 1.28, 0.52, 1],
              }
            : { scaleY: 1 }
        }
        transition={
          active
            ? {
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.35,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '12px 21px' }}
      />

      {/* Column 3 (shortest, right) */}
      <motion.path
        d="M19 21V15"
        animate={
          active
            ? {
                scaleY: [1, 0.32, 1.35, 1],
              }
            : { scaleY: 1 }
        }
        transition={
          active
            ? {
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.7,
              }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: '19px 21px' }}
      />
    </motion.svg>
  );
}

export { ChartNoAxesColumnDecreasing as ChartNoAxesColumnDecreasingIcon };
