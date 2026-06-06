'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  /** Seconds to wait before this element animates in. Use to stagger siblings. */
  delay?: number;
  /** Direction the element slides FROM. 'up' means it slides upward from below. */
  direction?: Direction;
  /** Translate distance in px. Default 24. */
  distance?: number;
  /** Animation duration in seconds. */
  duration?: number;
}

/**
 * Entrance animation primitive. Fades in + slides from one direction.
 *
 * <FadeIn>            — slides up from 24px below, 0.5s, no delay
 * <FadeIn delay={0.1} direction="left">   — slides in from 24px to the left
 * <FadeIn direction="none">                — pure fade, no slide
 */
export function FadeIn({
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.55,
  children,
  ...rest
}: FadeInProps) {
  const initial: { opacity: number; x?: number; y?: number } = { opacity: 0 };
  if (direction === 'up') initial.y = distance;
  if (direction === 'down') initial.y = -distance;
  if (direction === 'left') initial.x = distance;
  if (direction === 'right') initial.x = -distance;

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        // Smooth easeOutExpo-like curve — feels premium, not springy.
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
