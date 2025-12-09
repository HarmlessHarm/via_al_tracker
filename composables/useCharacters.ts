// Characters composable

import { useCharactersStore } from '~/stores/characters'
import { useAuthStore } from '~/stores/auth'
import type { CharacterFormData } from '~/types'

export const useCharacters = () => {
  const charactersStore = useCharactersStore()
  const authStore = useAuthStore()

  // Initialize store on first use
  if (charactersStore.characters.length === 0) {
    charactersStore.initialize()
  }

  /**
   * Get current player's characters
   */
  const myCharacters = computed(() => {
    if (!authStore.currentUser) return []
    return charactersStore.getCharactersByPlayerId(authStore.currentUser.id)
  })

  /**
   * Create character for current player
   */
  const createMyCharacter = (formData: CharacterFormData) => {
    if (!authStore.currentUser) {
      throw new Error('Must be logged in to create character')
    }

    return charactersStore.createCharacter(authStore.currentUser.id, formData)
  }

  /**
   * Get character by ID (with permission check)
   */
  const getCharacter = (characterId: string) => {
    const character = charactersStore.getCharacterById(characterId)

    if (!character) return null

    // Check permissions
    const currentUser = authStore.currentUser

    if (!currentUser) return null

    // Admin and DM can see all characters
    if (currentUser.role === 'admin' || currentUser.role === 'dm') {
      return character
    }

    // Players can only see their own characters
    if (character.playerId === currentUser.id) {
      return character
    }

    return null
  }

  return {
    // State
    myCharacters,
    allCharacters: computed(() => charactersStore.allCharacters),
    loading: computed(() => charactersStore.loading),
    error: computed(() => charactersStore.error),

    // Actions
    createCharacter: createMyCharacter,
    updateCharacter: charactersStore.updateCharacter,
    deleteCharacter: charactersStore.deleteCharacter,
    updateGold: charactersStore.updateGold,
    addGold: charactersStore.addGold,
    subtractGold: charactersStore.subtractGold,
    searchCharacters: charactersStore.searchCharacters,
    getCharacter,
    getCharactersByPlayerId: charactersStore.getCharactersByPlayerId
  }
}
