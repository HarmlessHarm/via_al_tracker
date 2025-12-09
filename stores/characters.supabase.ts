// Pinia store for characters using Supabase

import { defineStore } from 'pinia'
import type { Character, CharacterFormData, CharacterWithTotalLevel } from '~/types'
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
    async initialize() {
      await this.fetchCharacters()
    },

    /**
     * Fetch all characters from Supabase
     */
    async fetchCharacters() {
      const supabase = useSupabaseClient()
      this.loading = true

      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .order('name')

        if (error) throw error

        this.characters = data as Character[]
      } catch (error: any) {
        console.error('Error fetching characters:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch characters for specific player
     */
    async fetchPlayerCharacters(playerId: string) {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('playerId', playerId)
          .order('name')

        if (error) throw error

        // Update only the player's characters in the store
        this.characters = [
          ...this.characters.filter(c => c.playerId !== playerId),
          ...(data as Character[])
        ]
      } catch (error: any) {
        console.error('Error fetching player characters:', error)
        this.error = error.message
      }
    },

    /**
     * Create a new character
     */
    async createCharacter(playerId: string, formData: CharacterFormData): Promise<Character> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('characters')
          .insert({
            playerId,
            name: formData.name,
            classes: formData.classes,
            race: formData.race,
            background: formData.background,
            characterSource: formData.characterSource,
            dndBeyondLink: formData.dndBeyondLink,
            pdfUrl: formData.pdfUrl,
            gold: formData.gold
          })
          .select()
          .single()

        if (error) throw error

        const newCharacter = data as Character

        // Add to local state
        this.characters.push(newCharacter)

        return newCharacter
      } catch (error: any) {
        console.error('Error creating character:', error)
        throw new Error(error.message || 'Failed to create character')
      }
    },

    /**
     * Update character
     */
    async updateCharacter(characterId: string, formData: Partial<CharacterFormData>): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('characters')
          .update({
            ...formData,
            updatedAt: new Date().toISOString()
          })
          .eq('id', characterId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.characters.findIndex(c => c.id === characterId)
        if (index !== -1) {
          this.characters[index] = data as Character
        }

        return true
      } catch (error: any) {
        console.error('Error updating character:', error)
        this.error = error.message
        return false
      }
    },

    /**
     * Delete character
     */
    async deleteCharacter(characterId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { error } = await supabase
          .from('characters')
          .delete()
          .eq('id', characterId)

        if (error) throw error

        // Remove from local state
        this.characters = this.characters.filter(c => c.id !== characterId)

        return true
      } catch (error: any) {
        console.error('Error deleting character:', error)
        this.error = error.message
        return false
      }
    },

    /**
     * Update character gold
     */
    async updateGold(characterId: string, newGold: number): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('characters')
          .update({
            gold: newGold,
            updatedAt: new Date().toISOString()
          })
          .eq('id', characterId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.characters.findIndex(c => c.id === characterId)
        if (index !== -1) {
          this.characters[index] = data as Character
        }

        return true
      } catch (error: any) {
        console.error('Error updating gold:', error)
        return false
      }
    },

    /**
     * Add gold to character
     */
    async addGold(characterId: string, amount: number): Promise<boolean> {
      const char = this.characters.find(c => c.id === characterId)
      if (!char) return false

      return await this.updateGold(characterId, char.gold + amount)
    },

    /**
     * Subtract gold from character
     */
    async subtractGold(characterId: string, amount: number): Promise<boolean> {
      const char = this.characters.find(c => c.id === characterId)
      if (!char || char.gold < amount) return false

      return await this.updateGold(characterId, char.gold - amount)
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
