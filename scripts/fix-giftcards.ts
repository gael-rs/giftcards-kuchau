import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function fixGiftcards() {
  try {
    // Buscar el usuario "aldo"
    const user = await prisma.user.findUnique({
      where: { username: 'aldo' }
    })

    if (!user) {
      console.error('❌ Usuario "aldo" no encontrado')
      process.exit(1)
    }

    console.log(`✅ Usuario encontrado: ${user.username} (ID: ${user.id})`)

    // Obtener todas las giftcards existentes
    const existingGiftcards = await prisma.giftcard.findMany({
      where: { userId: user.id },
      select: { number: true }
    })

    const existingNumbers = new Set(existingGiftcards.map(g => g.number))
    console.log(`📊 Giftcards existentes: ${existingNumbers.size}`)

    // Identificar qué números faltan (del 1 al 150)
    const missing: number[] = []
    for (let i = 1; i <= 150; i++) {
      if (!existingNumbers.has(i)) {
        missing.push(i)
      }
    }

    if (missing.length === 0) {
      console.log('\n✅ Todas las giftcards del 1 al 150 ya existen!')
      
      // Verificar el total
      const total = await prisma.giftcard.count({
        where: { userId: user.id }
      })
      console.log(`📊 Total en BD: ${total}`)
      
      // Mostrar algunas para verificar
      const sample = await prisma.giftcard.findMany({
        where: { userId: user.id },
        orderBy: { number: 'asc' },
        select: { number: true, code: true }
      })
      
      console.log(`\n📋 Primeras 5 giftcards:`)
      sample.slice(0, 5).forEach(gc => {
        console.log(`   #${gc.number}: ${gc.code}`)
      })
      
      console.log(`\n📋 Últimas 5 giftcards:`)
      sample.slice(-5).forEach(gc => {
        console.log(`   #${gc.number}: ${gc.code}`)
      })
      
      process.exit(0)
    }

    console.log(`\n⚠️  Faltan ${missing.length} giftcards`)
    console.log(`   Números faltantes: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '...' : ''}`)

    // Crear las giftcards faltantes
    console.log(`\n🚀 Creando ${missing.length} giftcards faltantes...`)

    const giftcardsToCreate = missing.map(number => ({
      code: `GC-${String(number).padStart(3, '0')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      number,
      userId: user.id
    }))

    // Insertar en lotes de 50
    const batchSize = 50
    let totalCreated = 0

    for (let i = 0; i < giftcardsToCreate.length; i += batchSize) {
      const batch = giftcardsToCreate.slice(i, i + batchSize)
      const result = await prisma.giftcard.createMany({
        data: batch,
        skipDuplicates: true
      })
      totalCreated += result.count
      console.log(`   ✓ Lote ${Math.floor(i/batchSize) + 1}: ${result.count} giftcards creadas`)
    }

    console.log(`\n✅ ${totalCreated} giftcards creadas!`)

    // Verificar nuevamente
    const finalCount = await prisma.giftcard.count({
      where: { userId: user.id }
    })

    console.log(`\n📊 Total final de giftcards: ${finalCount}`)

    // Verificar que todas del 1 al 150 existen
    const finalCheck = await prisma.giftcard.findMany({
      where: { 
        userId: user.id,
        number: { gte: 1, lte: 150 }
      },
      select: { number: true }
    })

    const finalNumbers = new Set(finalCheck.map(g => g.number))
    const stillMissing: number[] = []
    for (let i = 1; i <= 150; i++) {
      if (!finalNumbers.has(i)) {
        stillMissing.push(i)
      }
    }

    if (stillMissing.length === 0) {
      console.log(`✅ Todas las giftcards del 1 al 150 están presentes!`)
    } else {
      console.log(`⚠️  Aún faltan ${stillMissing.length} giftcards: ${stillMissing.join(', ')}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixGiftcards()

