import * as React from 'react';

// --- Utility Function (Replace with your actual `cn` utility if available) ---
// Simple example function to combine class names, similar to `clsx` or `classnames`
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// --- 1. Avatar Root Component ---

interface AvatarProps extends React.ComponentPropsWithoutRef<'div'> {
  // Add any specific props if needed
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

// --- 2. Avatar Image Component ---

interface AvatarImageProps extends React.ComponentPropsWithoutRef<'img'> {
  // Add any specific props if needed
}

function AvatarImage({
  className,
  ...props
}: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={cn(
        // Styles for the image itself:
        'aspect-square size-full object-cover', // object-cover added for better visual
        className,
      )}
      {...props}
    />
  );
}

// --- 3. Avatar Fallback Component ---

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<'div'> {
  // Add any specific props if needed
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
        // Styles for the fallback state (e.g., initials or icon):
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