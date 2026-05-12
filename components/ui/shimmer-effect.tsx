import React from 'react';

interface ShimmerEffectProps {
  /**
   * Optional CSS class override
   */
  className?: string;
  /**
   * Child elements to apply shimmer effect over
   */
  children?: React.ReactNode;
}

/**
 * Shimmer effect wrapper component.
 * Adds an animated gradient overlay to indicate loading content.
 * Can be applied to skeleton lists or content areas.
 *
 * @example
 * ```tsx
 * <ShimmerEffect>
 *   <div className="space-y-4">
 *     <Skeleton width="w-full" height="h-20" />
 *     <Skeleton width="w-full" height="h-20" />
 *   </div>
 * </ShimmerEffect>
 * ```
 */
export function ShimmerEffect({
  className = '',
  children,
}: ShimmerEffectProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      aria-busy="true"
    >
      {children}
      <div
        className={`
          absolute inset-0
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
          opacity-20
          animate-shimmer
        `}
        style={{
          backgroundSize: '200% 100%',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
