import * as React from 'react';

interface ComponentNumberProps extends React.ComponentPropsWithoutRef<'span'> {
  // Accepts a number (or string) to display
  children: React.ReactNode;
}

/**
 * Renders a large, bold, visually striking number.
 * Default styles: Very large, bold, and white text (assuming dark background context).
 */
export function ComponentNumber({
  className,
  children,
  ...props
}: ComponentNumberProps) {
  return (
    <span
      className={`text-3xl font-bold text-white ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Example Usage:
// <ComponentNumber>{index + 1}</ComponentNumber> // Renders "1", "2", etc.
// <ComponentNumber className="text-blue-500">10</ComponentNumber>