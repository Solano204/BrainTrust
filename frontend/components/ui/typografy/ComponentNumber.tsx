import * as React from 'react';

interface ComponentNumberProps extends React.ComponentPropsWithoutRef<'span'> {
  children: React.ReactNode;
}

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
