import React from 'react';

interface PulsingDotProps {
  /**
   * Size of the pulsing dot
   * @default 'md' (w-3 h-3)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color of the dot
   * @default 'brand' (teal)
   */
  color?: 'brand' | 'white' | 'success' | 'urgent';
  /**
   * Optional CSS class override
   */
  className?: string;
  /**
   * Accessibility label
   * @default 'Loading indicator'
   */
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const colorClasses = {
  brand: 'bg-brand',
  white: 'bg-white',
  success: 'bg-status-success-fg',
  urgent: 'bg-accent-urgent',
};

/**
 * Pulsing dot component for gentle loading/notification indicators.
 * Displays a small colored dot with a pulsing animation.
 *
 * @example
 * ```tsx
 * <PulsingDot size="md" color="brand" ariaLabel="New messages pending" />
 * ```
 */
export function PulsingDot({
  size = 'md',
  color = 'brand',
  className = '',
  ariaLabel = 'Loading indicator',
}: PulsingDotProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full
        animate-pulse
        inline-block
        ${className}
      `}
      role="status"
      aria-label={ariaLabel}
    />
  );
}
