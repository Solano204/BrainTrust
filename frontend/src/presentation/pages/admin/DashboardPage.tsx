"use client"

import { Card, CardContent } from "@components/common/ui/card"
import { Users, GraduationCap, BookOpen, Calendar, AlertCircle, Menu, Bell, Settings, LogOut } from "lucide-react"
import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { useState, useEffect, useRef } from "react"


// Interfaces TypeScript
interface UserData {
    id: number
    usuario: string
    rol: string
    nombre: string
    email: string
}

interface Estadisticas {
    total_alumnos: number
    total_profesores: number
    total_cursos_activos: number
    ciclo_actual: string
    ultima_actualizacion: string
}

interface ConfiguracionSistema {
    nombre_institucion: string
    descripcion_sistema: string
}

interface DatabaseJSON {
    estadisticas: Estadisticas
    configuracion_sistema: ConfiguracionSistema
}

// Componente de fondo 3D con partículas
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
            size: number
            speedX: number
            speedY: number
            opacity: number
        }> = []

        // Crear partículas
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, i) => {
                // Actualizar posición
                particle.x += particle.speedX
                particle.y += particle.speedY

                // Rebotar en los bordes
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

                // Dibujar partícula con gradiente
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2
                )
                gradient.addColorStop(0, `rgba(59, 130, 246, ${particle.opacity})`)
                gradient.addColorStop(1, `rgba(99, 102, 241, 0)`)

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
                ctx.fill()

                // Conectar partículas cercanas
                particles.forEach((p2, j) => {
                    if (i !== j) {
                        const dx = particle.x - p2.x
                        const dy = particle.y - p2.y
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        if (distance < 150) {
                            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`
                            ctx.lineWidth = 0.5
                            ctx.beginPath()
                            ctx.moveTo(particle.x, particle.y)
                            ctx.lineTo(p2.x, p2.y)
                            ctx.stroke()
                        }
                    }
                })
            })

            requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.4 }}
        />
    )
}

// // Header mejorado
// const AdminHeader = () => {
//   return (
//     <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-14">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
//               <GraduationCap className="w-5 h-5 text-white" />
//             </div>
//             <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               Sistema Académico
//             </h1>
//           </div>

//           <nav className="flex items-center gap-2">
//             <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
//               <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
//             </button>
//             <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
//               <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
//             </button>
//             <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
//               <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
//             </button>
//           </nav>
//         </div>
//       </div>
//     </header>
//   )
// }

// Footer profesional
const Footer = () => {
    return (
        <footer className="relative z-10 mt-12 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Sistema Académico</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">Gestión educativa profesional</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Enlaces</h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Soporte</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Documentación</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Términos</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Contacto</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">contacto@academia.edu</p>
                        <div className="flex gap-2 mt-2">
                            {['F', 'T', 'I', 'L'].map((social, i) => (
                                <button
                                    key={i}
                                    className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform text-xs font-bold"
                                >
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-center text-xs text-slate-500">
                    © 2025 Sistema Académico. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    )
}

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false)
    const [studentsCount, setStudentsCount] = useState(0)
    const [teachersCount, setTeachersCount] = useState(0)
    const [coursesCount, setCoursesCount] = useState(0)

    const [userData, setUserData] = useState<UserData | null>(null)
    const [sistemData, setSystemData] = useState<ConfiguracionSistema | null>(null)
    const [cicloActual, setCicloActual] = useState("2025")

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cargar datos del usuario desde localStorage
    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                setUserData(user)
            } catch (err) {
                console.error("Error al cargar usuario:", err)
            }
        }
    }, [])

    // Cargar estadísticas desde JSON
    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                setIsLoading(true)
                const response = await fetch('/data/usuarios_db.json')

                if (!response.ok) {
                    throw new Error('No se pudo cargar las estadísticas')
                }

                const data: DatabaseJSON = await response.json()

                setSystemData(data.configuracion_sistema)
                setCicloActual(data.estadisticas.ciclo_actual)

                animateCount(data.estadisticas.total_alumnos, setStudentsCount)
                animateCount(data.estadisticas.total_profesores, setTeachersCount)
                animateCount(data.estadisticas.total_cursos_activos, setCoursesCount)

                setIsLoading(false)
            } catch (err) {
                console.error('Error cargando estadísticas:', err)
                setError('No se pudieron cargar las estadísticas. Usando valores por defecto.')

                animateCount(500, setStudentsCount)
                animateCount(20, setTeachersCount)
                animateCount(10, setCoursesCount)

                setIsLoading(false)
            }
        }

        cargarEstadisticas()
    }, [])

    const animateCount = (
        target: number,
        setter: React.Dispatch<React.SetStateAction<number>>,
        duration = 2000
    ) => {
        const increment = target / (duration / 16)
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setter(target)
                clearInterval(timer)
            } else {
                setter(Math.floor(current))
            }
        }, 16)

        return timer
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            <ParticleBackground />
            <AdminHeader />

            <main className="container mx-auto px-4 py-6 relative z-10">
                {error && (
                    <div className="mb-4 max-w-5xl mx-auto">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">{error}</p>
                        </div>
                    </div>
                )}

                <div
                    className={`text-center mb-8 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}
                >
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        BIENVENIDO
                    </h1>
                    <h2 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
                        {isLoading ? "Cargando..." : userData?.nombre || "Usuario"}
                    </h2>

                    {userData && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                                {userData.rol}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {/* Students Card */}
                    <div
                        className={`transform transition-all duration-700 delay-100 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                            }`}
                        style={{ perspective: '1000px' }}
                    >
                        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

                            <CardContent className="p-5 text-center relative z-10">
                                <div className="flex justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                                    Alumnos Registrados
                                </h3>
                                <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {studentsCount}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Teachers Card */}
                    <div
                        className={`transform transition-all duration-700 delay-200 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                            }`}
                        style={{ perspective: '1000px' }}
                    >
                        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

                            <CardContent className="p-5 text-center relative z-10">
                                <div className="flex justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                        <GraduationCap className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                                    Profesores Registrados
                                </h3>
                                <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {teachersCount}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Courses Card */}
                    <div
                        className={`transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                            }`}
                        style={{ perspective: '1000px' }}
                    >
                        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

                            <CardContent className="p-5 text-center relative z-10">
                                <div className="flex justify-center mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                                    Cursos Activos
                                </h3>
                                <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                                    {coursesCount}
                                </p>
                                <div className="flex items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Ciclo {cicloActual}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}