import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, filename } = body

    if (!imageData || !filename) {
      return NextResponse.json(
        { error: 'imageData y filename son requeridos' },
        { status: 400 }
      )
    }

    // Convertir data URL a buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Guardar en public/giftcards/
    const publicDir = path.join(process.cwd(), 'public', 'giftcards')
    await fs.mkdir(publicDir, { recursive: true })
    
    const filePath = path.join(publicDir, filename)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json(
      { message: 'Imagen guardada exitosamente', path: `/giftcards/${filename}` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error guardando imagen:', error)
    return NextResponse.json(
      { error: 'Error al guardar la imagen' },
      { status: 500 }
    )
  }
}

