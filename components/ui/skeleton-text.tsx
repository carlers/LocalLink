import React from 'react';

interface SkeletonTextProps {
  /**
   * Number of lines to render
   * @default 1
   */
  lines?: number;
  /**
   * Width of the skeleton text
   * @default 'w-full'
   */
  width?: string;
  /**
   * Optional spacing between lines
   * @default 'gap-2'
   */
  gap?: string;
  /**
   * Optional CSS class override
   */
  className?: string;
}

/**
 * Skeleton text component for paragraph/text placeholders.
 * Displays animated text-height lines while content loads.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} width="w-full" />
 * ```
 */
export function SkeletonText({
  lines = 1,
  width = 'w-full',
  gap = 'gap-2',
  className = '',
}: SkeletonTextProps) {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`
            h-4
            bg-surface-muted
            animate-pulse
            rounded-sm
            ${i === lines - 1 ? 'w-3/4' : width}
          `}
          aria-busy="true"
        />
      ))}
    </div>
  );
}
