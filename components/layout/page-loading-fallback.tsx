import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface PageLoadingFallbackProps {
  /**
   * Message to display above spinner
   * @default 'Loading...'
   */
  message?: string;
  /**
   * Optional description text
   */
  description?: string;
}

/**
 * Full-page loading fallback for Suspense boundaries.
 * Displays a centered spinner with optional message.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<PageLoadingFallback message="Loading profile..." />}>
 *   <ProfileContent />
 * </Suspense>
 * ```
 */
export function PageLoadingFallback({
  message = 'Loading...',
  description,
}: PageLoadingFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Spinner size="lg" color="brand" ariaLabel={message} />
        <div className="space-y-2">
          <p className="text-foreground font-semibold">{message}</p>
          {description && (
            <p className="text-text-muted text-sm">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
