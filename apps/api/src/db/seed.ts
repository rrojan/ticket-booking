import { db, closeConnection } from './index.js'
import { concerts, ticketTiers } from './schema/index.js'
import { sql } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.execute(sql`TRUNCATE TABLE bookings, ticket_tiers, concerts RESTART IDENTITY CASCADE`)

  // Seed 5 concerts with dummy data
  const concertData = [
    {
      name: 'Rachana Dahal Live',
      artist: 'Rachana Dahal',
      date: new Date('2026-03-15T19:00:00Z'),
      venue: 'LOD',
      description: 'Hey Bhagwan Tour',
    },
    {
      name: 'Nepathya - Greatest Hits Tour',
      artist: 'Nepathya',
      date: new Date('2026-03-15T19:00:00Z'),
      venue: 'Trisara',
      description: 'Legendary Nepali rock band Nepathya!!',
    },
    {
      name: 'Cobweb - Rock Night',
      artist: 'Cobweb',
      date: new Date('2026-04-20T18:30:00Z'),
      venue: 'LOD',
      description: 'Heavy rock mustic night with Cobweb',
    },
    {
      name: 'TOOL - Fear Inoculum Tour',
      artist: 'TOOL',
      date: new Date('2026-05-10T20:00:00Z'),
      venue: 'London',
      description: 'Prog metal LEGENDS',
    },
    {
      name: 'Sajjan Raj Vaidya Live',
      artist: 'Sajjan Raj Vaidya',
      date: new Date('2026-06-05T19:30:00Z'),
      venue: 'LOD',
      description: 'Acoustic session with Sajjan Raj Vaidya',
    },
  ]

  const insertedConcerts = await db.insert(concerts).values(concertData).returning()

  console.log(`✅ Inserted ${insertedConcerts.length} concerts`)

  // Create ticket tiers with enum types matching schema
  const tierTemplates = [
    {
      tierType: 'VIP' as const,
      price: '100.00',
      quantities: [50, 100, 30, 80, 10],
    },
    {
      tierType: 'FRONT_ROW' as const,
      price: '50.00',
      quantities: [150, 200, 120, 180, 100],
    },
    {
      tierType: 'GA' as const,
      price: '10.00',
      quantities: [1500, 2000, 1000, 1800, 1200],
    },
  ]

  const ticketTierData = []

  for (let i = 0; i < insertedConcerts.length; i++) {
    const concert = insertedConcerts[i]
    for (const template of tierTemplates) {
      const quantity = template.quantities[i]
      ticketTierData.push({
        concertId: concert!.id,
        tierType: template.tierType,
        price: template.price,
        totalQuantity: quantity,
        availableQuantity: quantity,
      })
    }
  }

  // @ts-expect-error Will get to this later
  const insertedTiers = await db.insert(ticketTiers).values(ticketTierData).returning()

  console.log(`✅ Inserted ${insertedTiers.length} ticket tiers`)
  console.log('🎉 Database seeded successfully!')

  await closeConnection()
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
