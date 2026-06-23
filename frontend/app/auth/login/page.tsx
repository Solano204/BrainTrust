"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const getRedirectByRole = (role: string) => {
    if (role?.toLowerCase() === 'admin') return '/admin/users'
    return '/'
  }

  // Show full-page spinner ONLY on initial auth check (before user interacts).
  // Once the user has pressed submit (submitting=true) we keep the form mounted
  // so the error can be displayed and state is not lost.
  if (authLoading && !submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setIsLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      // Keep isLoading=true so button stays in "loading" state during navigation.
      // router.replace() avoids adding login to browser history.
      router.replace(getRedirectByRole(result.role ?? ''))
    } else {
      setError(result.error || 'Correo o contraseña incorrectos. Inténtalo de nuevo.')
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">BrainTrust</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de aprendizaje</p>
        </div>

        <div className="card-padded space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Iniciar sesión</h2>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Iniciando sesión...</>
                : 'Iniciar sesión'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
