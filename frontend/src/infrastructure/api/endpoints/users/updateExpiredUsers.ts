// app/api/usuarios/actualizar-vencidos/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// IMPORTANTE: Deshabilitar caché en Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    ultimo_acceso?: string
    materias?: string[]
}

interface UsuariosDB {
    usuarios: Usuario[]
}

export async function POST(request: Request) {
    console.log('🔵 API Actualizar-Vencidos INICIADA')

    try {
        // Obtener el body de la petición
        const body = await request.json()
        const { usuarioId } = body // ID del usuario específico a verificar

        const filePath = path.join(process.cwd(), 'public', 'data', 'usuarios_db.json')
        console.log('📁 Ruta del archivo:', filePath)

        // Leer el archivo
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const data: UsuariosDB = JSON.parse(fileContent)
        console.log('✅ JSON parseado correctamente')
        console.log('👥 Total usuarios:', data.usuarios.length)

        const fechaActual = new Date()
        fechaActual.setHours(0, 0, 0, 0)
        console.log('📅 Fecha actual:', fechaActual.toISOString().split('T')[0])

        let usuariosActualizados = 0
        const usuariosModificados: any[] = []

        // Si se proporciona un ID específico, solo actualizar ese usuario
        if (usuarioId) {
            console.log(`🎯 Verificando solo usuario ID: ${usuarioId}`)

            const index = data.usuarios.findIndex(u => u.id === usuarioId)

            if (index === -1) {
                return NextResponse.json({
                    success: false,
                    error: 'Usuario no encontrado'
                }, { status: 404 })
            }

            const usuario = data.usuarios[index]

            if (!usuario.fecha_Ven) {
                return NextResponse.json({
                    success: true,
                    message: 'Usuario sin fecha de vencimiento',
                    usuarioActivo: usuario.activo
                })
            }

            const [year, month, day] = usuario.fecha_Ven.split('-').map(Number)
            const fechaVencimiento = new Date(year, month - 1, day)
            fechaVencimiento.setHours(0, 0, 0, 0)

            console.log(`🔍 Usuario: ${usuario.usuario}`)
            console.log(`   - Fecha vencimiento: ${usuario.fecha_Ven}`)
            console.log(`   - Estado actual: ${usuario.activo ? 'ACTIVO' : 'INACTIVO'}`)
            console.log(`   - ¿Vencido?: ${fechaActual > fechaVencimiento ? 'SÍ' : 'NO'}`)

            // Si está vencido y activo, desactivar
            if (fechaActual > fechaVencimiento && usuario.activo) {
                data.usuarios[index] = {
                    ...usuario,
                    activo: false
                }

                usuariosActualizados = 1
                usuariosModificados.push({
                    usuario: usuario.usuario,
                    nombre: usuario.nombre_completo,
                    fecha_vencimiento: usuario.fecha_Ven
                })

                console.log(`   ⚠️  DESACTIVANDO usuario ${usuario.usuario}`)

                // Guardar el archivo
                const jsonString = JSON.stringify(data, null, 4)
                await fs.writeFile(filePath, jsonString, 'utf-8')
                console.log('✅ Archivo guardado correctamente')

                return NextResponse.json({
                    success: true,
                    message: `Usuario ${usuario.usuario} desactivado por vencimiento`,
                    usuariosActualizados: 1,
                    usuariosModificados,
                    fechaActual: fechaActual.toISOString().split('T')[0]
                })
            }

            return NextResponse.json({
                success: true,
                message: 'Usuario verificado, no requiere actualización',
                usuarioActivo: usuario.activo,
                fechaActual: fechaActual.toISOString().split('T')[0]
            })
        }

        // Si NO se proporciona ID, verificar TODOS (para cron jobs o tareas programadas)
        console.log('🔄 Verificando TODOS los usuarios...')

        data.usuarios = data.usuarios.map(usuario => {
            if (!usuario.fecha_Ven) {
                return usuario
            }

            const [year, month, day] = usuario.fecha_Ven.split('-').map(Number)
            const fechaVencimiento = new Date(year, month - 1, day)
            fechaVencimiento.setHours(0, 0, 0, 0)

            if (fechaActual > fechaVencimiento && usuario.activo) {
                usuariosActualizados++
                usuariosModificados.push({
                    usuario: usuario.usuario,
                    nombre: usuario.nombre_completo,
                    fecha_vencimiento: usuario.fecha_Ven
                })
                console.log(`   ⚠️  DESACTIVANDO usuario ${usuario.usuario}`)
                return {
                    ...usuario,
                    activo: false
                }
            }

            return usuario
        })

        console.log(`📊 Total usuarios desactivados: ${usuariosActualizados}`)

        if (usuariosActualizados > 0) {
            const jsonString = JSON.stringify(data, null, 4)
            await fs.writeFile(filePath, jsonString, 'utf-8')
            console.log('✅ Archivo guardado correctamente')

            return NextResponse.json({
                success: true,
                message: `Se actualizaron ${usuariosActualizados} usuarios vencidos`,
                usuariosActualizados,
                usuariosModificados,
                fechaActual: fechaActual.toISOString().split('T')[0]
            })
        }

        return NextResponse.json({
            success: true,
            message: 'No hay usuarios vencidos',
            usuariosActualizados: 0
        })

    } catch (error) {
        console.error('❌ Error general:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Error al actualizar usuarios',
                detalles: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    console.log('🔵 GET Request recibido - verificando todos los usuarios')
    // Para GET, verificar todos (útil para cron jobs)
    return POST(new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({})
    }))
}