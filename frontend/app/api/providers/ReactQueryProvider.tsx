// File: src/app/providers/QueryProvider.tsx (or similar)
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

// Create a client outside the component to persist across renders
// Use state to ensure it is created only once on the client
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Set an initial staleTime (e.g., 5 minutes for better performance)
        staleTime: 1000 * 60 * 5, 
      },
    },
  });
}

// Custom Provider component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Option 1: Using a static instance (simpler, but can lead to issues with server-side rendering if not handled carefully)
  // const queryClient = new QueryClient();

  // Option 2: Using React state to ensure the client is only created once on the client side (Recommended for Next.js App Router)
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: React Query Devtools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}