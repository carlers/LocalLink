import React from 'react';

interface SpinnerProps {
  /**
   * Size of the spinner in Tailwind units
   * @default 'md' (w-5 h-5)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color of the spinner
   * @default 'brand' (teal)
   */
  color?: 'brand' | 'white' | 'muted';
  /**
   * Accessibility label describing the loading state
   * @default 'Loading...'
   */
  ariaLabel?: string;
  /**
   * Optional CSS class override
   */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const colorClasses = {
  brand: 'text-brand',
  white: 'text-white',
  muted: 'text-text-muted',
};

/**
 * Spinner component for loading states.
 * Displays a rotating circle icon with accessibility support.
 *
 * @example
 * ```tsx
 * <Spinner size="md" color="brand" ariaLabel="Loading businesses..." />
 * ```
 */
export function Spinner({
  size = 'md',
  color = 'brand',
  ariaLabel = 'Loading...',
  className = '',
}: SpinnerProps) {
  return (
    <svg
      className={`
        animate-spin
        inline-block
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
