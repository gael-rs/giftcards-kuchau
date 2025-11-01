import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// GET - Obtener una giftcard específica por número
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Manejar params que es Promise en Next.js 16+
    const resolvedParams = await params
    
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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

    const giftcardNumber = parseInt(resolvedParams.id)

    if (isNaN(giftcardNumber)) {
      return NextResponse.json(
        { error: 'ID de giftcard inválido' },
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

    // Obtener la giftcard del usuario por número
    const giftcard = await prisma.giftcard.findUnique({
      where: {
        userId_number: {
          userId,
          number: giftcardNumber
        }
      },
      select: {
        id: true,
        code: true,
        number: true,
        imageUrl: true,
        createdAt: true
      }
    })

    if (!giftcard) {
      console.error(`Giftcard no encontrada - userId: ${userId}, number: ${giftcardNumber}`)
      return NextResponse.json(
        { error: 'Giftcard no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ giftcard }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo giftcard:', error)
    return NextResponse.json(
      { error: 'Error al obtener giftcard' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar la imagen de una giftcard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Manejar params que es Promise en Next.js 16+
    const resolvedParams = await params
    
    const body = await request.json()
    const { token, imageUrl } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 401 }
      )
    }

    const giftcardNumber = parseInt(resolvedParams.id)

    if (isNaN(giftcardNumber)) {
      return NextResponse.json(
        { error: 'ID de giftcard inválido' },
        { status: 400 }
      )
    }

    // Verificar token
    const decodedUnverified = jwt.decode(token, { complete: true }) as {
      header: { alg?: string }
      payload: {
        id: string
        username: string
        role?: string
      }
    } | null

    let userId: string | null = null
    let userRole: string | null = null

    if (decodedUnverified && decodedUnverified.header?.alg === 'none') {
      // VULNERABILIDAD: Buscar usuario por username cuando alg es "none"
      const username = decodedUnverified.payload.username
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, role: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        )
      }

      userId = user.id
      userRole = user.role || null
    } else {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string }
        userId = decoded.id
        userRole = decoded.role || null
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

    // Obtener la giftcard
    const giftcard = await prisma.giftcard.findUnique({
      where: {
        userId_number: {
          userId,
          number: giftcardNumber
        }
      }
    })

    if (!giftcard) {
      return NextResponse.json(
        { error: 'Giftcard no encontrada' },
        { status: 404 }
      )
    }

    // Solo el propietario o un admin puede actualizar
    if (giftcard.userId !== userId && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Actualizar la imagen
    const updatedGiftcard = await prisma.giftcard.update({
      where: {
        id: giftcard.id
      },
      data: {
        imageUrl: imageUrl || null
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
      { message: 'Imagen actualizada exitosamente', giftcard: updatedGiftcard },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando imagen de giftcard:', error)
    return NextResponse.json(
      { error: 'Error al actualizar imagen' },
      { status: 500 }
    )
  }
}

