import * as React from 'react';

interface ComponentTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  children: React.ReactNode;
}

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
