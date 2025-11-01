import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateGiftcards() {
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

    // Verificar cuántas giftcards ya tiene
    const existingCount = await prisma.giftcard.count({
      where: { userId: user.id }
    })

    console.log(`📊 Giftcards existentes: ${existingCount}`)

    // Eliminar todas las giftcards existentes si el usuario quiere empezar de cero
    if (existingCount > 0) {
      console.log(`\n🗑️  Eliminando ${existingCount} giftcards existentes...`)
      await prisma.giftcard.deleteMany({
        where: { userId: user.id }
      })
      console.log(`✅ Giftcards eliminadas`)
    }

    const startNumber = 1
    const endNumber = 150
    const toCreate = 150

    console.log(`\n🚀 Generando ${toCreate} giftcards (del #${startNumber} al #${endNumber})...`)

    const giftcards = []
    for (let i = startNumber; i <= endNumber; i++) {
      // Generar un código único para cada giftcard
      const code = `GC-${String(i).padStart(3, '0')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      
      giftcards.push({
        code,
        number: i,
        userId: user.id
      })
    }

    // Insertar todas las giftcards en lotes para evitar límites
    const batchSize = 50
    let totalCreated = 0
    
    for (let i = 0; i < giftcards.length; i += batchSize) {
      const batch = giftcards.slice(i, i + batchSize)
      const result = await prisma.giftcard.createMany({
        data: batch,
        skipDuplicates: true
      })
      totalCreated += result.count
      console.log(`   ✓ Lote ${Math.floor(i/batchSize) + 1}: ${result.count} giftcards creadas`)
    }

    console.log(`\n✅ ${totalCreated} giftcards creadas exitosamente!`)
    console.log(`📝 Giftcards del #${startNumber} al #${endNumber} generadas`)

    // Mostrar algunas de las giftcards creadas
    const sample = await prisma.giftcard.findMany({
      where: { userId: user.id },
      orderBy: { number: 'asc' },
      take: 5,
      select: { number: true, code: true }
    })

    console.log('\n📋 Ejemplos de giftcards creadas:')
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

generateGiftcards()

