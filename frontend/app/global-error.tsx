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
          padding: '20px'
        }}>
          <h2>¡Algo salió mal!</h2>
          <button onClick={() => reset()}>
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
