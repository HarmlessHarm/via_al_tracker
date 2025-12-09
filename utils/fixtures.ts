// Fixture data generator for D&D AL Tracker POC

import type { User, Character, LootVoucher, AttendanceToken } from '~/types'

/**
 * Generate UUID (simple version for POC)
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate fixture users
 */
export function generateFixtureUsers(): User[] {
  const now = new Date().toISOString()

  return [
    {
      id: 'user-admin-1',
      email: 'admin@al.local',
      password: 'admin123', // WARNING: Plain text for POC only!
      role: 'admin',
      name: 'Admin User',
      createdAt: now,
      isActive: true
    },
    {
      id: 'user-dm-1',
      email: 'dm@al.local',
      password: 'dm123',
      role: 'dm',
      name: 'Dungeon Master',
      createdAt: now,
      isActive: true
    },
    {
      id: 'user-player-1',
      email: 'player1@al.local',
      password: 'player123',
      role: 'player',
      name: 'Alice Player',
      createdAt: now,
      isActive: true
    },
    {
      id: 'user-player-2',
      email: 'player2@al.local',
      password: 'player123',
      role: 'player',
      name: 'Bob Player',
      createdAt: now,
      isActive: true
    },
    {
      id: 'user-player-3',
      email: 'player3@al.local',
      password: 'player123',
      role: 'player',
      name: 'Charlie Player',
      createdAt: now,
      isActive: true
    }
  ]
}

/**
 * Generate fixture characters
 */
export function generateFixtureCharacters(): Character[] {
  const now = new Date().toISOString()

  return [
    // Alice's characters
    {
      id: 'char-1',
      playerId: 'user-player-1',
      name: 'Thorin Ironshield',
      classes: [{ class: 'Fighter', level: 5 }],
      race: 'Dwarf',
      background: 'Soldier',
      characterSource: 'manual',
      gold: 250,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'char-2',
      playerId: 'user-player-1',
      name: 'Eldrin the Wise',
      classes: [
        { class: 'Wizard', level: 3 },
        { class: 'Cleric', level: 2 }
      ],
      race: 'High Elf',
      background: 'Sage',
      characterSource: 'dndbeyond',
      dndBeyondLink: 'https://www.dndbeyond.com/characters/12345',
      gold: 180,
      createdAt: now,
      updatedAt: now
    },
    // Bob's characters
    {
      id: 'char-3',
      playerId: 'user-player-2',
      name: 'Shadow Whisper',
      classes: [{ class: 'Rogue', level: 8 }],
      race: 'Halfling',
      background: 'Criminal',
      characterSource: 'manual',
      gold: 450,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'char-4',
      playerId: 'user-player-2',
      name: 'Sir Galahad',
      classes: [{ class: 'Paladin', level: 4 }],
      race: 'Human',
      background: 'Noble',
      characterSource: 'pdf',
      pdfUrl: '/sample-character.pdf',
      gold: 320,
      createdAt: now,
      updatedAt: now
    },
    // Charlie's characters
    {
      id: 'char-5',
      playerId: 'user-player-3',
      name: 'Melody Songweaver',
      classes: [
        { class: 'Bard', level: 6 },
        { class: 'Warlock', level: 1 }
      ],
      race: 'Tiefling',
      background: 'Entertainer',
      characterSource: 'dndbeyond',
      dndBeyondLink: 'https://www.dndbeyond.com/characters/67890',
      gold: 275,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'char-6',
      playerId: 'user-player-3',
      name: 'Gruk Stonefist',
      classes: [{ class: 'Barbarian', level: 3 }],
      race: 'Half-Orc',
      background: 'Outlander',
      characterSource: 'manual',
      gold: 95,
      createdAt: now,
      updatedAt: now
    }
  ]
}

/**
 * Generate fixture loot vouchers
 */
export function generateFixtureLootVouchers(): LootVoucher[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString()

  return [
    // Thorin's loot
    {
      id: 'loot-1',
      characterId: 'char-1',
      name: 'Bag of Holding',
      description: 'A magical bag that can hold far more than its size suggests',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek
    },
    {
      id: 'loot-2',
      characterId: 'char-1',
      name: 'Potion of Greater Healing',
      description: 'Restores 4d4+4 hit points when consumed',
      rarity: 'common',
      isUsed: true,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek,
      usedAt: yesterday
    },
    {
      id: 'loot-3',
      characterId: 'char-1',
      name: 'Flame Tongue Longsword',
      description: 'A magical sword that bursts into flames when activated',
      rarity: 'rare',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: yesterday
    },
    // Eldrin's loot
    {
      id: 'loot-4',
      characterId: 'char-2',
      name: 'Wand of Magic Missiles',
      description: 'Can cast Magic Missile spell with charges',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek
    },
    {
      id: 'loot-5',
      characterId: 'char-2',
      name: 'Scroll of Fireball',
      description: 'One-time use spell scroll',
      rarity: 'common',
      isUsed: true,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek,
      usedAt: yesterday
    },
    // Shadow Whisper's loot
    {
      id: 'loot-6',
      characterId: 'char-3',
      name: 'Cloak of Elvenkind',
      description: 'Grants advantage on Stealth checks',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek
    },
    {
      id: 'loot-7',
      characterId: 'char-3',
      name: 'Dagger +1',
      description: 'A finely crafted magical dagger',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: yesterday
    },
    {
      id: 'loot-8',
      characterId: 'char-3',
      name: 'Ring of Invisibility',
      description: 'Allows the wearer to become invisible',
      rarity: 'legendary',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: now
    },
    // Sir Galahad's loot
    {
      id: 'loot-9',
      characterId: 'char-4',
      name: 'Plate Armor +1',
      description: 'Enchanted full plate armor',
      rarity: 'rare',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek
    },
    {
      id: 'loot-10',
      characterId: 'char-4',
      name: 'Holy Avenger',
      description: 'A legendary paladin weapon',
      rarity: 'legendary',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: yesterday
    },
    // Melody's loot
    {
      id: 'loot-11',
      characterId: 'char-5',
      name: 'Instrument of the Bards (Doss Lute)',
      description: 'A magical musical instrument',
      rarity: 'rare',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: lastWeek
    },
    {
      id: 'loot-12',
      characterId: 'char-5',
      name: 'Cloak of Protection',
      description: '+1 to AC and saving throws',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: yesterday
    },
    // Gruk's loot
    {
      id: 'loot-13',
      characterId: 'char-6',
      name: 'Greataxe of Warning',
      description: 'Grants advantage on initiative and prevents surprise',
      rarity: 'uncommon',
      isUsed: false,
      awardedBy: 'user-dm-1',
      awardedAt: now
    }
  ]
}

/**
 * Generate fixture attendance tokens
 */
export function generateFixtureAttendanceTokens(): AttendanceToken[] {
  const now = new Date().toISOString()
  const dates = [
    new Date(Date.now() - 21 * 86400000).toISOString(), // 3 weeks ago
    new Date(Date.now() - 14 * 86400000).toISOString(), // 2 weeks ago
    new Date(Date.now() - 7 * 86400000).toISOString(),  // 1 week ago
    new Date(Date.now() - 3 * 86400000).toISOString(),  // 3 days ago
    now
  ]

  const sessions = [
    'Dragon of Icespire Peak - Session 1',
    'Dragon of Icespire Peak - Session 2',
    'Dragon of Icespire Peak - Session 3',
    'Waterdeep: Dragon Heist - Session 1',
    'Waterdeep: Dragon Heist - Session 2'
  ]

  const tokens: AttendanceToken[] = []
  const characters = ['char-1', 'char-2', 'char-3', 'char-4', 'char-5', 'char-6']

  // Generate attendance for each character across different sessions
  characters.forEach((charId, charIndex) => {
    // Each character attends 3-5 sessions
    const sessionCount = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < sessionCount; i++) {
      tokens.push({
        id: `attendance-${tokens.length + 1}`,
        characterId: charId,
        sessionName: sessions[i],
        sessionDate: dates[i],
        awardedBy: 'user-dm-1',
        awardedAt: dates[i]
      })
    }
  })

  return tokens
}

/**
 * Initialize all fixture data
 * Returns all fixture data in one object
 */
export function generateAllFixtures() {
  return {
    users: generateFixtureUsers(),
    characters: generateFixtureCharacters(),
    lootVouchers: generateFixtureLootVouchers(),
    attendanceTokens: generateFixtureAttendanceTokens()
  }
}

/**
 * Get fixture user credentials for easy login testing
 */
export function getFixtureCredentials() {
  return {
    admin: { email: 'admin@al.local', password: 'admin123' },
    dm: { email: 'dm@al.local', password: 'dm123' },
    player1: { email: 'player1@al.local', password: 'player123' },
    player2: { email: 'player2@al.local', password: 'player123' },
    player3: { email: 'player3@al.local', password: 'player123' }
  }
}
