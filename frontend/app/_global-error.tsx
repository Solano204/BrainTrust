'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2>¡Algo salió mal!</h2>
          <p style={{ color: '#666' }}>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}