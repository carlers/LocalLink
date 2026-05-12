import React from 'react';

interface SkeletonProps {
  /**
   * Width of the skeleton - any Tailwind width class or custom width
   * @example 'w-full', 'w-48', 'w-1/2'
   */
  width?: string;
  /**
   * Height of the skeleton - any Tailwind height class or custom height
   * @example 'h-4', 'h-12', 'h-screen'
   */
  height?: string;
  /**
   * Border radius - determines skeleton shape
   * @default 'rounded-md'
   */
  rounded?: 'rounded-none' | 'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
  /**
   * Optional CSS class override
   */
  className?: string;
}

/**
 * Skeleton loader component for content placeholders.
 * Displays an animated gray box while content loads.
 *
 * @example
 * ```tsx
 * <Skeleton width="w-full" height="h-12" rounded="rounded-lg" />
 * ```
 */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-surface-muted
        animate-pulse
        ${width}
        ${height}
        ${rounded}
        ${className}
      `}
      aria-busy="true"
      aria-label="Loading content"
    />
  );
}
