import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validaciones
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar JWT - VULNERABLE: No especificamos algoritmo explícitamente
    // Esto permite el ataque de "algorithm confusion" cambiando el algoritmo a "none"
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role || 'user'
      },
      JWT_SECRET
      // Intencionalmente NO especificamos algorithm aquí para la vulnerabilidad CTF
    )

    // Login exitoso
    return NextResponse.json(
      {
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'user'
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}

