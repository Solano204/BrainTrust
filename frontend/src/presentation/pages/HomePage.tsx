"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/src/presentation/components/common/ui/button"
import { Input } from "@/src/presentation/components/common/ui/input"
import { Label } from "@/src/presentation/components/common/ui/label"
import { Eye, EyeOff, AlertCircle, Loader2, Shield, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Usuario {
  id: number
  usuario: string
  password: string
  rol: string
  nombre_completo: string
  email: string
  activo: boolean
  fecha_Ini?: string
  fecha_Ven?: string
}

interface UsuariosDB {
  usuarios: Usuario[]
}

// Componente de partículas 3D de fondo
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
    }> = []
    const particleCount = 80

    class Particle {
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.z = Math.random() * 1500
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.vz = (Math.random() - 0.5) * 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.z += this.vz

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
        if (this.z < 0 || this.z > 1500) this.vz *= -1
      }

      draw() {
        const scale = 1000 / (1000 + this.z)
        const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2
        const size = 2 * scale

        const opacity = 1 - this.z / 1500
        ctx.fillStyle = `rgba(0, 217, 255, ${opacity * 0.6})`
        ctx.beginPath()
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.update()
        particle.draw()

        // Conexiones entre partículas cercanas
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x
          const dy = particles[j].y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3
            ctx.strokeStyle = `rgba(0, 102, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
    />
  )
}

export default function LoginPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usuariosDB, setUsuariosDB] = useState<UsuariosDB | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const formatearFecha = (fecha: Date): string => {
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  const limpiarCampos = () => {
    setUsuario("")
    setPassword("")
    setShowPassword(false)
    setError("")
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Función para verificar y actualizar UN usuario específico
  const verificarUsuarioVencido = async (usuarioId: number) => {
    console.log('🔄 Verificando vencimiento del usuario ID:', usuarioId)

    try {
      const response = await fetch('/api/usuarios/actualizar-vencidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ usuarioId })
      })

      console.log('📡 Respuesta recibida:', response.status)

      if (!response.ok) {
        console.error('❌ Error en respuesta:', response.status)
        return null
      }

      const result = await response.json()
      console.log('✅ Resultado de verificación:', result)

      return result

    } catch (err) {
      console.error('❌ Error llamando API de verificación:', err)
      return null
    }
  }

  // Cargar usuarios SOLO una vez al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      console.log('🚀 Cargando usuarios...')

      try {
        // Agregar timestamp para evitar caché del navegador
        const timestamp = new Date().getTime()
        const response = await fetch(`/data/usuarios_db.json?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })

        if (!response.ok) {
          throw new Error('No se pudo cargar la base de datos')
        }

        const data = await response.json()
        console.log('✅ Usuarios cargados:', data.usuarios.length)

        setUsuariosDB(data)
      } catch (err) {
        console.error('❌ Error cargando usuarios:', err)
        setError('Error al cargar el sistema. Intenta recargar la página.')
      }
    }

    cargarUsuarios()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!usuariosDB) {
      setError("Sistema no inicializado. Recarga la página.")
      setIsLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Buscar usuario por credenciales
    const usuarioEncontrado = usuariosDB.usuarios.find(
      (u) => u.usuario === usuario && u.password === password
    )

    if (!usuarioEncontrado) {
      setError("Usuario o contraseña incorrectos")
      setIsLoading(false)
      setTimeout(limpiarCampos, 3000)
      return
    }

    console.log('🔐 Usuario encontrado:', {
      id: usuarioEncontrado.id,
      usuario: usuarioEncontrado.usuario,
      activo: usuarioEncontrado.activo,
      fecha_Ini: usuarioEncontrado.fecha_Ini,
      fecha_Ven: usuarioEncontrado.fecha_Ven
    })

    // 📋 ORDEN DE VALIDACIONES SEGÚN EL PIZARRÓN:

    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    // ✅ VALIDACIÓN 1: Fecha antes del Inicio → Cuenta Por Activarse
    if (usuarioEncontrado.fecha_Ini) {
      const [yearIni, monthIni, dayIni] = usuarioEncontrado.fecha_Ini.split('-').map(Number)
      const fechaInicio = new Date(yearIni, monthIni - 1, dayIni)
      fechaInicio.setHours(0, 0, 0, 0)

      if (fechaActual < fechaInicio) {
        console.log('⏸️  VALIDACIÓN 1: Cuenta por activarse')
        setError("Cuenta por activarse. Disponible a partir del " + formatearFecha(fechaInicio))
        setIsLoading(false)
        setTimeout(limpiarCampos, 3000)
        return
      }
    }

    // ✅ VALIDACIÓN 2: Fecha después del Final → Cuenta Vencida
    if (usuarioEncontrado.fecha_Ven) {
      const [yearVen, monthVen, dayVen] = usuarioEncontrado.fecha_Ven.split('-').map(Number)
      const fechaVencimiento = new Date(yearVen, monthVen - 1, dayVen)
      fechaVencimiento.setHours(0, 0, 0, 0)

      if (fechaActual > fechaVencimiento) {
        console.log('⏰ VALIDACIÓN 2: Cuenta vencida')

        // 1ra Vez (interno) → Cambiar el activo a False
        if (usuarioEncontrado.activo) {
          console.log('🔄 Primera vez detectando vencimiento - Desactivando usuario...')
          await verificarUsuarioVencido(usuarioEncontrado.id)
        }

        setError("Cuenta vencida. La fecha de vencimiento era: " + formatearFecha(fechaVencimiento))
        setIsLoading(false)
        setTimeout(limpiarCampos, 3000)
        return
      }
    }

    // ✅ VALIDACIÓN 3: Fecha después del Final y activo False → Cuenta Caducada
    if (usuarioEncontrado.fecha_Ven) {
      const [yearVen, monthVen, dayVen] = usuarioEncontrado.fecha_Ven.split('-').map(Number)
      const fechaVencimiento = new Date(yearVen, monthVen - 1, dayVen)
      fechaVencimiento.setHours(0, 0, 0, 0)

      if (fechaActual > fechaVencimiento && !usuarioEncontrado.activo) {
        console.log('🔴 VALIDACIÓN 3: Cuenta caducada (ya fue desactivada)')
        setError("Cuenta Caducada. Contacta al administrador")
        setIsLoading(false)
        setTimeout(limpiarCampos, 3000)
        return
      }
    }

    // ✅ VALIDACIÓN ADICIONAL: Si el usuario está inactivo sin fecha (por admin)
    if (!usuarioEncontrado.activo) {
      console.log('🔴 Usuario inactivo (desactivado por administrador)')
      setError("Cuenta Caducada. Contacta al administrador")
      setIsLoading(false)
      setTimeout(limpiarCampos, 3000)
      return
    }

    // ✅ TODAS LAS VALIDACIONES PASADAS - LOGIN EXITOSO
    localStorage.setItem("user", JSON.stringify({
      id: usuarioEncontrado.id,
      usuario: usuarioEncontrado.usuario,
      rol: usuarioEncontrado.rol,
      nombre: usuarioEncontrado.nombre_completo,
      email: usuarioEncontrado.email
    }))

    console.log("✅ Login exitoso:", usuarioEncontrado.nombre_completo)
    router.push("/dashboard")
  }

  return (
    <div className="h-screen overflow-hidden relative">
      <ParticleBackground />

      {/* Gradiente overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none z-10" />

      <div className="relative z-20 h-screen flex items-center justify-center p-3">
        <div className="w-full max-w-md">

          {/* Logo flotante superior izquierda */}
          <div
            className="fixed top-2 left-2 z-50 transition-transform duration-300"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
            }}
          >
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-1 shadow-2xl shadow-blue-500/50">
              <div className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center">
                    <Image
                      src="/Img/Escuela.png"
                      alt="Logo"
                      width={80}
                      height={80}
                      className="rounded-r-full"
                      priority
                    />              
                </div>
            </div>
          </div>

          {/* Tarjeta principal con glassmorphism */}
          <div
            className="relative backdrop-blur-2xl bg-gray-900/40 rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden transition-all duration-500 hover:shadow-blue-500/50"
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`,
              boxShadow: '0 25px 50px -12px rgba(0, 102, 255, 0.4), inset 0 0 60px rgba(0, 217, 255, 0.1)'
            }}
          >
            {/* Brillo animado superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse" />

            <div className="p-6 sm:p-8">
              {/* Logo central 3D */}
              <div className="flex justify-center mb-4">
                <div
                  className="relative group cursor-pointer"
                  style={{
                    transform: `perspective(800px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl p-2 shadow-2xl border border-blue-400/50">
                    <Image
                      src="/Img/Logo.png"
                      alt="Logo"
                      width={80}
                      height={80}
                      className="rounded"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Título con efecto neón */}
              <div className="text-center mb-5">
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  BrainTrust Academy
                </h1>
              </div>

              {/* Alerta de error con animación */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2 backdrop-blur-sm animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-300 leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Campo Usuario */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <div className="w-1 h-3 bg-cyan-400 rounded-full" />
                    Usuario
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full h-11 bg-gray-800/50 border-2 border-blue-500/30 rounded-lg px-3 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-cyan-400/20 text-sm"
                      placeholder="Ingresa tu usuario"
                      disabled={isLoading || !usuariosDB}
                      required
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <div className="w-1 h-3 bg-cyan-400 rounded-full" />
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-gray-800/50 border-2 border-blue-500/30 rounded-lg px-3 pr-10 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-cyan-400/20 text-sm"
                      placeholder="Ingresa tu contraseña"
                      disabled={isLoading || !usuariosDB}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 focus:outline-none"
                      disabled={isLoading || !usuariosDB}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-cyan-400/0 to-blue-500/0 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Botón de login con efecto 3D */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !usuariosDB}
                  className="relative w-full h-11 mt-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg font-bold text-white uppercase tracking-wide overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-400/50 active:scale-95 text-sm"
                  style={{
                    transform: 'perspective(500px) translateZ(0)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && usuariosDB) {
                      e.currentTarget.style.transform = 'perspective(500px) translateZ(10px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(500px) translateZ(0)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {!usuariosDB ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando Sistema
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validando
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </span>
                </Button>
              </div>

              {/* Footer compacto */}
              <div className="mt-5 pt-4 border-t border-blue-500/20 text-center space-y-2">
                <p className="text-gray-400 text-xs">¿Necesitas ayuda?</p>
                <div className="flex justify-center gap-3 text-xs">
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                    Soporte
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                    Recuperar Acceso
                  </a>
                </div>
                <p className="text-gray-500 text-xs pt-2">
                  © 2025 BrainTrust Academy
                </p>
              </div>
            </div>

            {/* Esquinas decorativas más pequeñas */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}