// Drizzle ORM schema for D&D Adventure League Tracker

import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['player', 'dm', 'admin'])
export const characterSourceEnum = pgEnum('character_source', ['manual', 'dndbeyond', 'pdf'])
export const lootRarityEnum = pgEnum('loot_rarity', ['common', 'uncommon', 'rare', 'very_rare', 'legendary'])

// Users table (extends Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // References auth.users.id
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('player'),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true)
})

// Characters table
export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  classes: jsonb('classes').notNull(), // Array of { class: string, level: number }
  race: varchar('race', { length: 100 }).notNull(),
  background: varchar('background', { length: 100 }).notNull(),
  characterSource: characterSourceEnum('character_source').notNull().default('manual'),
  dndBeyondLink: text('dnd_beyond_link'),
  pdfUrl: text('pdf_url'),
  gold: integer('gold').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Loot Vouchers table
export const lootVouchers = pgTable('loot_vouchers', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  rarity: lootRarityEnum('rarity').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  awardedBy: uuid('awarded_by').notNull().references(() => users.id),
  awardedAt: timestamp('awarded_at').notNull().defaultNow(),
  usedAt: timestamp('used_at')
})

// Attendance Tokens table
export const attendanceTokens = pgTable('attendance_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  sessionName: varchar('session_name', { length: 255 }).notNull(),
  sessionDate: timestamp('session_date').notNull(),
  awardedBy: uuid('awarded_by').notNull().references(() => users.id),
  awardedAt: timestamp('awarded_at').notNull().defaultNow()
})

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Character = typeof characters.$inferSelect
export type NewCharacter = typeof characters.$inferInsert

export type LootVoucher = typeof lootVouchers.$inferSelect
export type NewLootVoucher = typeof lootVouchers.$inferInsert

export type AttendanceToken = typeof attendanceTokens.$inferSelect
export type NewAttendanceToken = typeof attendanceTokens.$inferInsert
