import React from 'react';
import { SkeletonText } from '@/components/ui/skeleton-text';

interface ConversationLoadingFallbackProps {
  /**
   * Number of message skeletons to display
   * @default 5
   */
  messageCount?: number;
  /**
   * Optional CSS class override
   */
  className?: string;
}

/**
 * Loading fallback for conversation/message views.
 * Displays placeholder messages while conversation data loads.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ConversationLoadingFallback messageCount={5} />}>
 *   <ConversationPane />
 * </Suspense>
 * ```
 */
export function ConversationLoadingFallback({
  messageCount = 5,
  className = '',
}: ConversationLoadingFallbackProps) {
  return (
    <div
      className={`
        space-y-4
        p-4
        ${className}
      `}
      aria-busy="true"
      aria-label="Loading messages"
    >
      {Array.from({ length: messageCount }).map((_, i) => {
        const isAlternate = i % 2 === 0;
        // Alternate line counts for visual variety
        const lineCount = (i % 3) + 1;
        return (
          <div
            key={i}
            className={`flex ${isAlternate ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`
                ${isAlternate ? 'bg-surface-muted' : 'bg-brand'}
                rounded-2xl
                p-3
                max-w-xs
                w-auto
                space-y-2
              `}
            >
              <SkeletonText
                lines={lineCount}
                width="w-32"
                gap="gap-1"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
