import React from 'react';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { ShimmerEffect } from '@/components/ui/shimmer-effect';

interface ListLoadingFallbackProps {
  /**
   * Number of skeleton items to display
   * @default 4
   */
  count?: number;
  /**
   * Whether to show shimmer effect
   * @default true
   */
  withShimmer?: boolean;
  /**
   * Optional CSS class override
   */
  className?: string;
}

/**
 * Loading fallback for list views (Discover, Home, etc.)
 * Displays multiple skeleton cards with optional shimmer effect.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ListLoadingFallback count={4} withShimmer={true} />}>
 *   <BusinessList />
 * </Suspense>
 * ```
 */
export function ListLoadingFallback({
  count = 4,
  withShimmer = true,
  className = '',
}: ListLoadingFallbackProps) {
  const content = (
    <div
      className={`
        space-y-4
        ${className}
      `}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          showImage={true}
          imageHeight="h-40"
          textLines={2}
        />
      ))}
    </div>
  );

  if (withShimmer) {
    return <ShimmerEffect>{content}</ShimmerEffect>;
  }

  return content;
}
