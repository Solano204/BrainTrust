import * as React from 'react';

interface ComponentDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
  // Allows the user to pass any children (text or elements)
  children: React.ReactNode;
}

/**
 * Renders a standard component description with text truncation.
 * Default styles: Small text, muted color, clamps content to 2 lines.
 */
export function ComponentDescription({
  className,
  children,
  ...props
}: ComponentDescriptionProps) {
  return (
    <p
      // Note: The 'line-clamp-2' class requires a utility like Tailwind CSS or a polyfill to work correctly.
      className={`text-sm text-muted-foreground line-clamp-2 ${className || ''}`}
      {...props}
    >
      {children}
    </p>
  );
}

// Example Usage (for a unit description):
// <ComponentDescription>{unit.description}</ComponentDescription>