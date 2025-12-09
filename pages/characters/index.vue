<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">
        {{ isAdmin || isDM ? 'All Characters' : 'My Characters' }}
      </h1>
      <NuxtLink to="/characters/new" class="btn btn-primary">
        <Icon name="heroicons:plus" class="h-5 w-5 mr-2" />
        New Character
      </NuxtLink>
    </div>

    <!-- Search -->
    <div v-if="isAdmin || isDM" class="form-control">
      <div class="input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search characters..."
          class="input input-bordered w-full"
        />
        <button class="btn btn-square">
          <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Character Grid -->
    <div v-if="displayedCharacters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CharacterCard
        v-for="character in displayedCharacters"
        :key="character.id"
        :character="character"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body text-center">
        <Icon name="heroicons:user-plus" class="h-16 w-16 mx-auto text-base-content/30" />
        <h3 class="text-xl font-semibold">No characters found</h3>
        <p class="text-base-content/70">
          {{ searchQuery ? 'Try adjusting your search' : 'Create your first character to get started!' }}
        </p>
        <div v-if="!searchQuery" class="card-actions justify-center mt-4">
          <NuxtLink to="/characters/new" class="btn btn-primary">
            <Icon name="heroicons:plus" class="h-5 w-5 mr-2" />
            Create Character
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { myCharacters, allCharacters, searchCharacters } = useCharacters()
const { isAdmin, isDM } = useAuth()

const searchQuery = ref('')

const displayedCharacters = computed(() => {
  if (searchQuery.value.trim()) {
    return searchCharacters(searchQuery.value)
  }

  return (isAdmin.value || isDM.value) ? allCharacters.value : myCharacters.value
})
</script>
