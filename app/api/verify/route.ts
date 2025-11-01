import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 401 }
      )
    }

    // VULNERABLE: Permitimos tokens con algoritmo "none" sin verificar la firma
    // El atacante puede modificar el token, cambiar el algoritmo a "none" y el username
    try {
      // Primero intentamos decodificar sin verificar (vulnerable a algoritmo "none")
      const decodedUnverified = jwt.decode(token, { complete: true }) as {
        header: { alg?: string }
        payload: {
          id: string
          username: string
          role: string
        }
      } | null

      // Si el token usa algoritmo "none", aceptamos sin verificar (VULNERABILIDAD)
      // Buscamos el usuario por username para obtener el id real
      if (decodedUnverified && decodedUnverified.header?.alg === 'none') {
        const username = decodedUnverified.payload.username
        
        // Buscar usuario por username en la BD
        const user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            username: true,
            role: true
          }
        })

        if (!user) {
          return NextResponse.json(
            { error: 'Usuario no encontrado', valid: false },
            { status: 401 }
          )
        }

        return NextResponse.json(
          {
            valid: true,
            user: {
              id: user.id,
              username: user.username,
              role: user.role || 'user'
            }
          },
          { status: 200 }
        )
      }

      // Si no es "none", intentamos verificar normalmente
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string
        username: string
        role: string
      }

      return NextResponse.json(
        {
          valid: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          }
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido', valid: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error verificando token:', error)
    return NextResponse.json(
      { error: 'Error al verificar token' },
      { status: 500 }
    )
  }
}

