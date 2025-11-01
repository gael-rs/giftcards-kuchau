import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Obtener el usuario del token
async function getUserFromToken(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return null
    }

    // Verificar token (acepta algoritmo "none" para vulnerabilidad CTF)
    const decodedUnverified = jwt.decode(token, { complete: true }) as {
      header: { alg?: string }
      payload: {
        id: string
        username: string
        role: string
      }
    } | null

    if (decodedUnverified && decodedUnverified.header?.alg === 'none') {
      return decodedUnverified.payload
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      username: string
      role: string
    }

    return decoded
  } catch (error) {
    return null
  }
}

// GET - Obtener todas las giftcards del usuario
export async function GET(request: NextRequest) {
  try {
    // Intentar obtener token del header Authorization
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Si no está en el header, intentar obtenerlo del query string
    if (!token) {
      const { searchParams } = new URL(request.url)
      token = searchParams.get('token') || undefined
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 401 }
      )
    }

    // Decodificar token
    const decodedUnverified = jwt.decode(token, { complete: true }) as {
      header: { alg?: string }
      payload: {
        id: string
        username: string
      }
    } | null

    let userId: string | null = null

    if (decodedUnverified && decodedUnverified.header?.alg === 'none') {
      // VULNERABILIDAD: Buscar usuario por username cuando alg es "none"
      const username = decodedUnverified.payload.username
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        )
      }

      userId = user.id
    } else {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
        userId = decoded.id
      } catch {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    // Obtener giftcards del usuario ordenadas por número
    const giftcards = await prisma.giftcard.findMany({
      where: { userId },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        code: true,
        number: true,
        imageUrl: true,
        createdAt: true
      }
    })

    return NextResponse.json({ giftcards }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo giftcards:', error)
    return NextResponse.json(
      { error: 'Error al obtener giftcards' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva giftcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, code } = body

    if (!token || !code) {
      return NextResponse.json(
        { error: 'Token y código son requeridos' },
        { status: 400 }
      )
    }

    // Verificar token
    const decodedUnverified = jwt.decode(token, { complete: true }) as {
      header: { alg?: string }
      payload: {
        id: string
        username: string
      }
    } | null

    let userId: string | null = null

    if (decodedUnverified && decodedUnverified.header?.alg === 'none') {
      // VULNERABILIDAD: Buscar usuario por username cuando alg es "none"
      const username = decodedUnverified.payload.username
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        )
      }

      userId = user.id
    } else {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
        userId = decoded.id
      } catch {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    // Obtener el número siguiente para este usuario
    const lastGiftcard = await prisma.giftcard.findFirst({
      where: { userId },
      orderBy: { number: 'desc' },
      select: { number: true }
    })

    const nextNumber = (lastGiftcard?.number || 0) + 1

    // Crear la giftcard
    const giftcard = await prisma.giftcard.create({
      data: {
        code,
        number: nextNumber,
        userId
      },
      select: {
        id: true,
        code: true,
        number: true,
        imageUrl: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { message: 'Giftcard creada exitosamente', giftcard },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando giftcard:', error)
    return NextResponse.json(
      { error: 'Error al crear giftcard' },
      { status: 500 }
    )
  }
}

