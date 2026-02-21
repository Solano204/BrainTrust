import * as React from 'react';

interface ComponentDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
  children: React.ReactNode;
}

export function ComponentDescription({
  className,
  children,
  ...props
}: ComponentDescriptionProps) {
  return (
    <p
      className={`text-sm text-muted-foreground line-clamp-2 ${className || ''}`}
      {...props}
    >
      {children}
    </p>
  );
}

