'use client'

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from './ReactQueryProvider';
import { AuthProvider } from '@/app/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}
