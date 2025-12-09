// Database seed script for fixture data

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { users, characters, lootVouchers, attendanceTokens } from './schema'
import { config } from 'dotenv'

// Load environment variables
config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Check your .env file.')
}

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client, { schema })

// Note: In production, use Supabase Auth to create users
// This is a POC seed script only
async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Insert users (in production, use Supabase Auth)
    console.log('Creating users...')
    const insertedUsers = await db.insert(users).values([
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@al.local',
        role: 'admin',
        name: 'Admin User',
        isActive: true
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'dm@al.local',
        role: 'dm',
        name: 'Dungeon Master',
        isActive: true
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'player1@al.local',
        role: 'player',
        name: 'Alice Player',
        isActive: true
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'player2@al.local',
        role: 'player',
        name: 'Bob Player',
        isActive: true
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        email: 'player3@al.local',
        role: 'player',
        name: 'Charlie Player',
        isActive: true
      }
    ]).returning()

    console.log(`✓ Created ${insertedUsers.length} users`)

    // Insert characters
    console.log('Creating characters...')
    const insertedCharacters = await db.insert(characters).values([
      {
        id: '10000000-0000-0000-0000-000000000001',
        playerId: '00000000-0000-0000-0000-000000000003',
        name: 'Thorin Ironshield',
        classes: [{ class: 'Fighter', level: 5 }],
        race: 'Dwarf',
        background: 'Soldier',
        characterSource: 'manual',
        gold: 250
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        playerId: '00000000-0000-0000-0000-000000000003',
        name: 'Eldrin the Wise',
        classes: [
          { class: 'Wizard', level: 3 },
          { class: 'Cleric', level: 2 }
        ],
        race: 'High Elf',
        background: 'Sage',
        characterSource: 'dndbeyond',
        dndBeyondLink: 'https://www.dndbeyond.com/characters/12345',
        gold: 180
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        playerId: '00000000-0000-0000-0000-000000000004',
        name: 'Shadow Whisper',
        classes: [{ class: 'Rogue', level: 8 }],
        race: 'Halfling',
        background: 'Criminal',
        characterSource: 'manual',
        gold: 450
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        playerId: '00000000-0000-0000-0000-000000000004',
        name: 'Sir Galahad',
        classes: [{ class: 'Paladin', level: 4 }],
        race: 'Human',
        background: 'Noble',
        characterSource: 'pdf',
        pdfUrl: '/sample-character.pdf',
        gold: 320
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        playerId: '00000000-0000-0000-0000-000000000005',
        name: 'Melody Songweaver',
        classes: [
          { class: 'Bard', level: 6 },
          { class: 'Warlock', level: 1 }
        ],
        race: 'Tiefling',
        background: 'Entertainer',
        characterSource: 'dndbeyond',
        dndBeyondLink: 'https://www.dndbeyond.com/characters/67890',
        gold: 275
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        playerId: '00000000-0000-0000-0000-000000000005',
        name: 'Gruk Stonefist',
        classes: [{ class: 'Barbarian', level: 3 }],
        race: 'Half-Orc',
        background: 'Outlander',
        characterSource: 'manual',
        gold: 95
      }
    ]).returning()

    console.log(`✓ Created ${insertedCharacters.length} characters`)

    // Insert loot vouchers
    console.log('Creating loot vouchers...')
    const insertedLoot = await db.insert(lootVouchers).values([
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        name: 'Bag of Holding',
        description: 'A magical bag that can hold far more than its size suggests',
        rarity: 'uncommon',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        name: 'Potion of Greater Healing',
        description: 'Restores 4d4+4 hit points when consumed',
        rarity: 'common',
        isUsed: true,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        name: 'Flame Tongue Longsword',
        description: 'A magical sword that bursts into flames when activated',
        rarity: 'rare',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000002',
        name: 'Wand of Magic Missiles',
        description: 'Can cast Magic Missile spell with charges',
        rarity: 'uncommon',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000003',
        name: 'Cloak of Elvenkind',
        description: 'Grants advantage on Stealth checks',
        rarity: 'uncommon',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000003',
        name: 'Ring of Invisibility',
        description: 'Allows the wearer to become invisible',
        rarity: 'legendary',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000004',
        name: 'Plate Armor +1',
        description: 'Enchanted full plate armor',
        rarity: 'rare',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000005',
        name: 'Instrument of the Bards (Doss Lute)',
        description: 'A magical musical instrument',
        rarity: 'rare',
        isUsed: false,
        awardedBy: '00000000-0000-0000-0000-000000000002'
      }
    ]).returning()

    console.log(`✓ Created ${insertedLoot.length} loot vouchers`)

    // Insert attendance tokens
    console.log('Creating attendance tokens...')
    const now = new Date()
    const insertedAttendance = await db.insert(attendanceTokens).values([
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        sessionName: 'Dragon of Icespire Peak - Session 1',
        sessionDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        sessionName: 'Dragon of Icespire Peak - Session 2',
        sessionDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000001',
        sessionName: 'Dragon of Icespire Peak - Session 3',
        sessionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000002',
        sessionName: 'Dragon of Icespire Peak - Session 1',
        sessionDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        awardedBy: '00000000-0000-0000-0000-000000000002'
      },
      {
        characterId: '10000000-0000-0000-0000-000000000003',
        sessionName: 'Waterdeep: Dragon Heist - Session 1',
        sessionDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        awardedBy: '00000000-0000-0000-0000-000000000002'
      }
    ]).returning()

    console.log(`✓ Created ${insertedAttendance.length} attendance tokens`)

    console.log('\n✅ Database seeded successfully!')
    console.log('\n📝 Test Users Created:')
    console.log('  Admin: admin@al.local (Set password in Supabase Auth)')
    console.log('  DM: dm@al.local (Set password in Supabase Auth)')
    console.log('  Player 1: player1@al.local (Set password in Supabase Auth)')
    console.log('  Player 2: player2@al.local (Set password in Supabase Auth)')
    console.log('  Player 3: player3@al.local (Set password in Supabase Auth)')
    console.log('\n⚠️  IMPORTANT: Go to Supabase Auth and create these users with matching emails!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await client.end()
  }
}

seed()
