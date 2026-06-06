'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/cn';

interface MarqueeProps {
  /** Children are rendered twice back-to-back for a seamless loop. */
  children: React.ReactNode;
  /** Time in seconds for one full pass. Higher = slower. */
  speed?: number;
  /** Right-to-left (default) or left-to-right. */
  reverse?: boolean;
  /** Pause animation on hover (defaults true — keeps cards readable on intent). */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Infinite horizontal marquee. Children render twice; we animate the inner
 * track from 0 → -50% so the seam between the two copies is invisible.
 *
 * Use case: featured shop / brand carousel on landing page.
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn('group/marquee relative w-full overflow-hidden', className)}
      // Edge fade — keeps cards from popping in/out abruptly.
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
      }}
    >
      <motion.div
        ref={trackRef}
        className={cn(
          'flex w-max gap-6',
          pauseOnHover && '[&:hover]:[animation-play-state:paused]',
          'group-hover/marquee:[--play:paused]',
        )}
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {/* Duplicate so the loop is seamless. aria-hidden on the clone. */}
        <div className="flex shrink-0 gap-6">{children}</div>
        <div className="flex shrink-0 gap-6" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
