// Form validation helpers for D&D AL Tracker

import type { ClassLevel, CharacterFormData, UserFormData } from '~/types'

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength (basic)
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  return { valid: true }
}

/**
 * Validate character name
 */
export function validateCharacterName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Character name is required' }
  }
  if (name.trim().length < 2) {
    return { valid: false, message: 'Character name must be at least 2 characters' }
  }
  if (name.length > 50) {
    return { valid: false, message: 'Character name must be less than 50 characters' }
  }
  return { valid: true }
}

/**
 * Validate class level (1-20)
 */
export function validateClassLevel(level: number): { valid: boolean; message?: string } {
  if (level < 1) {
    return { valid: false, message: 'Level must be at least 1' }
  }
  if (level > 20) {
    return { valid: false, message: 'Level cannot exceed 20' }
  }
  return { valid: true }
}

/**
 * Calculate total level from class levels
 */
export function calculateTotalLevel(classes: ClassLevel[]): number {
  return classes.reduce((total, cls) => total + cls.level, 0)
}

/**
 * Validate total character level (multiclass support)
 */
export function validateTotalLevel(classes: ClassLevel[]): { valid: boolean; message?: string } {
  const totalLevel = calculateTotalLevel(classes)

  if (classes.length === 0) {
    return { valid: false, message: 'At least one class is required' }
  }

  if (totalLevel > 20) {
    return { valid: false, message: 'Total level cannot exceed 20' }
  }

  // Validate each individual class level
  for (const cls of classes) {
    if (!cls.class || cls.class.trim().length === 0) {
      return { valid: false, message: 'Class name cannot be empty' }
    }

    const levelValidation = validateClassLevel(cls.level)
    if (!levelValidation.valid) {
      return levelValidation
    }
  }

  return { valid: true }
}

/**
 * Validate gold amount
 */
export function validateGold(gold: number): { valid: boolean; message?: string } {
  if (gold < 0) {
    return { valid: false, message: 'Gold cannot be negative' }
  }
  return { valid: true }
}

/**
 * Validate D&D Beyond link
 */
export function validateDndBeyondLink(link: string): { valid: boolean; message?: string } {
  if (!link || link.trim().length === 0) {
    return { valid: true } // Optional field
  }

  const dndBeyondPattern = /^https?:\/\/(www\.)?dndbeyond\.com\//
  if (!dndBeyondPattern.test(link)) {
    return { valid: false, message: 'Must be a valid D&D Beyond URL' }
  }

  return { valid: true }
}

/**
 * Validate complete character form
 */
export function validateCharacterForm(data: CharacterFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const nameValidation = validateCharacterName(data.name)
  if (!nameValidation.valid) {
    errors.name = nameValidation.message!
  }

  const levelValidation = validateTotalLevel(data.classes)
  if (!levelValidation.valid) {
    errors.classes = levelValidation.message!
  }

  if (!data.race || data.race.trim().length === 0) {
    errors.race = 'Race is required'
  }

  if (!data.background || data.background.trim().length === 0) {
    errors.background = 'Background is required'
  }

  const goldValidation = validateGold(data.gold)
  if (!goldValidation.valid) {
    errors.gold = goldValidation.message!
  }

  if (data.characterSource === 'dndbeyond' && data.dndBeyondLink) {
    const linkValidation = validateDndBeyondLink(data.dndBeyondLink)
    if (!linkValidation.valid) {
      errors.dndBeyondLink = linkValidation.message!
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate user form
 */
export function validateUserForm(data: UserFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!validateEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message!
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required'
  }

  if (!data.role) {
    errors.role = 'Role is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate loot voucher name
 */
export function validateLootName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Loot voucher name is required' }
  }
  if (name.length > 100) {
    return { valid: false, message: 'Name must be less than 100 characters' }
  }
  return { valid: true }
}

/**
 * Validate session name
 */
export function validateSessionName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Session name is required' }
  }
  if (name.length > 100) {
    return { valid: false, message: 'Session name must be less than 100 characters' }
  }
  return { valid: true }
}
