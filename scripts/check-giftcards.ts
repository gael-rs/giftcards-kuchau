import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function checkGiftcards() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'aldo' }
    })

    if (!user) {
      console.error('❌ Usuario "aldo" no encontrado')
      process.exit(1)
    }

    const count = await prisma.giftcard.count({
      where: { userId: user.id }
    })

    console.log(`📊 Total de giftcards para "aldo": ${count}`)

    // Obtener el rango de números
    const minGiftcard = await prisma.giftcard.findFirst({
      where: { userId: user.id },
      orderBy: { number: 'asc' },
      select: { number: true }
    })

    const maxGiftcard = await prisma.giftcard.findFirst({
      where: { userId: user.id },
      orderBy: { number: 'desc' },
      select: { number: true }
    })

    console.log(`📝 Rango de números: ${minGiftcard?.number || 'N/A'} - ${maxGiftcard?.number || 'N/A'}`)

    // Verificar si faltan números
    if (minGiftcard && maxGiftcard) {
      const allNumbers = new Set<number>()
      for (let i = minGiftcard.number; i <= maxGiftcard.number; i++) {
        allNumbers.add(i)
      }

      const existingNumbers = await prisma.giftcard.findMany({
        where: { userId: user.id },
        select: { number: true }
      })

      const existingSet = new Set(existingNumbers.map(g => g.number))
      const missing: number[] = []

      for (let i = 1; i <= 150; i++) {
        if (!existingSet.has(i)) {
          missing.push(i)
        }
      }

      if (missing.length > 0) {
        console.log(`\n⚠️  Faltan ${missing.length} giftcards:`)
        console.log(`   Números faltantes: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '...' : ''}`)
      } else {
        console.log(`\n✅ Todas las giftcards del 1 al 150 están presentes`)
      }
    }

    // Mostrar algunas giftcards
    const sample = await prisma.giftcard.findMany({
      where: { userId: user.id },
      orderBy: { number: 'asc' },
      take: 10,
      select: { number: true, code: true }
    })

    console.log(`\n📋 Primeras 10 giftcards:`)
    sample.forEach(gc => {
      console.log(`   #${gc.number}: ${gc.code}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkGiftcards()

