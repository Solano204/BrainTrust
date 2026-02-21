import * as React from 'react';

const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};


interface AvatarProps extends React.ComponentPropsWithoutRef<'div'> {

}

function Avatar({
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        // Base styles for the Avatar container:
        'relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}


interface AvatarImageProps extends React.ComponentPropsWithoutRef<'img'> {

}

function AvatarImage({
  className,
  ...props
}: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={cn(
        'aspect-square size-full object-cover', // object-cover added for better visual
        className,
      )}
      {...props}
    />
  );
}


interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<'div'> {

}

function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        'bg-gray-200 dark:bg-gray-700 flex size-full items-center justify-center rounded-full text-sm font-medium text-gray-800 dark:text-gray-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };