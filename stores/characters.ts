// Pinia store for characters

import { defineStore } from 'pinia'
import type { Character, CharacterFormData, CharacterWithTotalLevel } from '~/types'
import { getStorageItem, setStorageItem, StorageKeys } from '~/utils/storage'
import { generateFixtureCharacters } from '~/utils/fixtures'
import { calculateTotalLevel } from '~/utils/validators'

export const useCharactersStore = defineStore('characters', {
  state: () => ({
    characters: [] as Character[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    /**
     * Get all characters with computed total level
     */
    charactersWithLevel: (state): CharacterWithTotalLevel[] => {
      return state.characters.map(char => ({
        ...char,
        totalLevel: calculateTotalLevel(char.classes)
      }))
    },

    /**
     * Get characters by player ID
     */
    getCharactersByPlayerId: (state) => {
      return (playerId: string): CharacterWithTotalLevel[] => {
        return state.characters
          .filter(char => char.playerId === playerId)
          .map(char => ({
            ...char,
            totalLevel: calculateTotalLevel(char.classes)
          }))
      }
    },

    /**
     * Get character by ID
     */
    getCharacterById: (state) => {
      return (characterId: string): CharacterWithTotalLevel | undefined => {
        const char = state.characters.find(c => c.id === characterId)
        if (!char) return undefined

        return {
          ...char,
          totalLevel: calculateTotalLevel(char.classes)
        }
      }
    },

    /**
     * Get all characters (for admin/DM views)
     */
    allCharacters: (state): CharacterWithTotalLevel[] => {
      return state.characters.map(char => ({
        ...char,
        totalLevel: calculateTotalLevel(char.classes)
      }))
    }
  },

  actions: {
    /**
     * Initialize characters store
     */
    initialize() {
      const storedCharacters = getStorageItem<Character[]>(StorageKeys.CHARACTERS)

      if (storedCharacters && storedCharacters.length > 0) {
        this.characters = storedCharacters
      } else {
        // First time - load fixtures
        this.characters = generateFixtureCharacters()
        setStorageItem(StorageKeys.CHARACTERS, this.characters)
      }
    },

    /**
     * Create a new character
     */
    createCharacter(playerId: string, formData: CharacterFormData): Character {
      const now = new Date().toISOString()

      const newCharacter: Character = {
        id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        playerId,
        name: formData.name,
        classes: formData.classes,
        race: formData.race,
        background: formData.background,
        characterSource: formData.characterSource,
        dndBeyondLink: formData.dndBeyondLink,
        pdfUrl: formData.pdfUrl,
        gold: formData.gold,
        createdAt: now,
        updatedAt: now
      }

      this.characters.push(newCharacter)
      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return newCharacter
    },

    /**
     * Update character
     */
    updateCharacter(characterId: string, formData: Partial<CharacterFormData>): boolean {
      const charIndex = this.characters.findIndex(c => c.id === characterId)

      if (charIndex === -1) return false

      this.characters[charIndex] = {
        ...this.characters[charIndex],
        ...formData,
        updatedAt: new Date().toISOString()
      }

      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return true
    },

    /**
     * Delete character
     */
    deleteCharacter(characterId: string): boolean {
      const charIndex = this.characters.findIndex(c => c.id === characterId)

      if (charIndex === -1) return false

      this.characters.splice(charIndex, 1)
      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return true
    },

    /**
     * Update character gold
     */
    updateGold(characterId: string, newGold: number): boolean {
      const char = this.characters.find(c => c.id === characterId)

      if (!char) return false

      char.gold = newGold
      char.updatedAt = new Date().toISOString()

      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return true
    },

    /**
     * Add gold to character
     */
    addGold(characterId: string, amount: number): boolean {
      const char = this.characters.find(c => c.id === characterId)

      if (!char) return false

      char.gold += amount
      char.updatedAt = new Date().toISOString()

      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return true
    },

    /**
     * Subtract gold from character
     */
    subtractGold(characterId: string, amount: number): boolean {
      const char = this.characters.find(c => c.id === characterId)

      if (!char || char.gold < amount) return false

      char.gold -= amount
      char.updatedAt = new Date().toISOString()

      setStorageItem(StorageKeys.CHARACTERS, this.characters)

      return true
    },

    /**
     * Search characters by name
     */
    searchCharacters(query: string): CharacterWithTotalLevel[] {
      const lowerQuery = query.toLowerCase()

      return this.characters
        .filter(char =>
          char.name.toLowerCase().includes(lowerQuery) ||
          char.race.toLowerCase().includes(lowerQuery) ||
          char.classes.some(cls => cls.class.toLowerCase().includes(lowerQuery))
        )
        .map(char => ({
          ...char,
          totalLevel: calculateTotalLevel(char.classes)
        }))
    }
  }
})
