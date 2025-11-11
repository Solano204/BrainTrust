import * as React from 'react';

interface ComponentTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  // Allows the user to pass any children (text or elements)
  children: React.ReactNode;
}

/**
 * Renders a standardized, responsive component title.
 * Default styles: Large, bold text with margin below.
 */
export function ComponentTitle({
  className,
  children,
  ...props
}: ComponentTitleProps) {
  return (
    <h2
      className={`text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 px-1 ${className || ''}`}
      {...props}
    >
      {children}
    </h2>
  );
}

// Example Usage:
// <ComponentTitle>Course Units</ComponentTitle>
// <ComponentTitle className="mt-8">Another Section</ComponentTitle>