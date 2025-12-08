// ==========================================
// 📁 src/lib/queryClient.ts
// ==========================================

import { QueryClient, DefaultOptions } from '@tanstack/react-query'

// ==========================================
// ⚙️ CONFIGURACIÓN DE QUERY CLIENT
// ==========================================

const queryConfig: DefaultOptions = {
  queries: {
    // Tiempo que los datos se consideran frescos (no se refetch automáticamente)
    staleTime: 1000 * 60 * 5, // 5 minutos

    // Tiempo que los datos permanecen en caché
    gcTime: 1000 * 60 * 30, // 30 minutos (antes era cacheTime)

    // Reintentos en caso de error
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch automático
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
  mutations: {
    // Configuración para mutaciones
    retry: 0,
  },
}

// ==========================================
// 🎯 CREAR QUERY CLIENT
// ==========================================

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

// ==========================================
// 🔧 UTILIDADES PARA MANEJO DE ERRORES
// ==========================================

export function handleQueryError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Ha ocurrido un error inesperado'
}

// ==========================================
// 📝 EJEMPLO DE USO EN app/layout.tsx o providers.tsx
// ==========================================

/*
"use client"

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
*/