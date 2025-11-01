import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function verifyAll() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'aldo' }
    })

    if (!user) {
      console.error('❌ Usuario "aldo" no encontrado')
      process.exit(1)
    }

    // Contar total
    const totalCount = await prisma.giftcard.count({
      where: { userId: user.id }
    })

    console.log(`\n📊 VERIFICACIÓN COMPLETA DE GIFTCARDS`)
    console.log(`=========================================`)
    console.log(`Total en BD: ${totalCount}`)

    // Verificar cada número del 1 al 150
    console.log(`\n🔍 Verificando números del 1 al 150...\n`)

    const allNumbers: number[] = []
    const missingNumbers: number[] = []

    for (let i = 1; i <= 150; i++) {
      const exists = await prisma.giftcard.findFirst({
        where: {
          userId: user.id,
          number: i
        }
      })

      if (exists) {
        allNumbers.push(i)
      } else {
        missingNumbers.push(i)
      }
    }

    console.log(`✅ Números presentes: ${allNumbers.length}`)
    console.log(`❌ Números faltantes: ${missingNumbers.length}`)

    if (missingNumbers.length > 0) {
      console.log(`\n⚠️  Faltan los siguientes números:`)
      console.log(`   ${missingNumbers.join(', ')}`)

      // Crear las faltantes
      console.log(`\n🚀 Creando ${missingNumbers.length} giftcards faltantes...`)

      const toCreate = missingNumbers.map(number => ({
        code: `GC-${String(number).padStart(3, '0')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        number,
        userId: user.id
      }))

      const result = await prisma.giftcard.createMany({
        data: toCreate,
        skipDuplicates: true
      })

      console.log(`✅ ${result.count} giftcards creadas\n`)
    } else {
      console.log(`\n✅ TODAS las giftcards del 1 al 150 están presentes!\n`)
    }

    // Mostrar resumen por rangos
    console.log(`\n📋 Resumen por rangos:`)
    const ranges = [
      { start: 1, end: 25, name: '1-25' },
      { start: 26, end: 50, name: '26-50' },
      { start: 51, end: 75, name: '51-75' },
      { start: 76, end: 100, name: '76-100' },
      { start: 101, end: 125, name: '101-125' },
      { start: 126, end: 150, name: '126-150' }
    ]

    for (const range of ranges) {
      const count = await prisma.giftcard.count({
        where: {
          userId: user.id,
          number: { gte: range.start, lte: range.end }
        }
      })
      const expected = range.end - range.start + 1
      const status = count === expected ? '✅' : '❌'
      console.log(`   ${status} Rango ${range.name}: ${count}/${expected}`)
    }

    // Verificación final
    const finalCount = await prisma.giftcard.count({
      where: { userId: user.id }
    })

    console.log(`\n📊 Total final: ${finalCount} giftcards`)
    
    if (finalCount === 150) {
      console.log(`\n🎉 ¡PERFECTO! Todas las 150 giftcards están en la BD`)
    } else {
      console.log(`\n⚠️  Se esperaban 150, hay ${finalCount}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAll()

