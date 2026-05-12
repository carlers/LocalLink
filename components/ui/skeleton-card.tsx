import React from 'react';
import { Skeleton } from './skeleton';
import { SkeletonText } from './skeleton-text';

interface SkeletonCardProps {
  /**
   * Whether to show image placeholder at top
   * @default true
   */
  showImage?: boolean;
  /**
   * Height of image skeleton if shown
   * @default 'h-48'
   */
  imageHeight?: string;
  /**
   * Number of text lines to show
   * @default 2
   */
  textLines?: number;
  /**
   * Optional CSS class override
   */
  className?: string;
}

/**
 * Skeleton card component for content card placeholders.
 * Displays a full card layout with optional image and text skeletons.
 *
 * @example
 * ```tsx
 * <SkeletonCard showImage={true} textLines={3} />
 * ```
 */
export function SkeletonCard({
  showImage = true,
  imageHeight = 'h-48',
  textLines = 2,
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`
        bg-surface
        rounded-panel
        p-4
        space-y-4
        ${className}
      `}
      aria-busy="true"
      aria-label="Loading card content"
    >
      {showImage && (
        <Skeleton
          width="w-full"
          height={imageHeight}
          rounded="rounded-lg"
        />
      )}
      <div className="space-y-3">
        <Skeleton width="w-3/4" height="h-5" rounded="rounded-sm" />
        <SkeletonText lines={textLines} width="w-full" gap="gap-2" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton width="w-full" height="h-9" rounded="rounded-chip" />
        <Skeleton width="w-full" height="h-9" rounded="rounded-chip" />
      </div>
    </div>
  );
}
