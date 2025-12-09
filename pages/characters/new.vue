<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <button @click="router.back()" class="btn btn-ghost btn-circle">
        <Icon name="heroicons:arrow-left" class="h-6 w-6" />
      </button>
      <h1 class="text-3xl font-bold">Create New Character</h1>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" />
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="card bg-base-100 shadow-xl">
      <div class="card-body space-y-6">
        <!-- Basic Info -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Basic Information</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Character Name *</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Enter character name"
                class="input input-bordered"
                :class="{ 'input-error': errors.name }"
                required
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-error">{{ errors.name }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Race *</span>
              </label>
              <select v-model="form.race" class="select select-bordered" required>
                <option value="">Select race</option>
                <option v-for="race in races" :key="race" :value="race">{{ race }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Background *</span>
              </label>
              <select v-model="form.background" class="select select-bordered" required>
                <option value="">Select background</option>
                <option v-for="bg in backgrounds" :key="bg" :value="bg">{{ bg }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Starting Gold</span>
              </label>
              <input
                v-model.number="form.gold"
                type="number"
                min="0"
                placeholder="0"
                class="input input-bordered"
              />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Classes -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Classes & Levels</h2>

          <div class="space-y-3">
            <div
              v-for="(classLevel, index) in form.classes"
              :key="index"
              class="flex gap-2 items-start"
            >
              <div class="form-control flex-1">
                <select v-model="classLevel.class" class="select select-bordered" required>
                  <option value="">Select class</option>
                  <option v-for="cls in dndClasses" :key="cls" :value="cls">{{ cls }}</option>
                </select>
              </div>

              <div class="form-control w-24">
                <input
                  v-model.number="classLevel.level"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Level"
                  class="input input-bordered"
                  required
                />
              </div>

              <button
                v-if="form.classes.length > 1"
                @click="removeClass(index)"
                type="button"
                class="btn btn-error btn-square"
              >
                <Icon name="heroicons:trash" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4">
            <button
              @click="addClass"
              type="button"
              class="btn btn-outline btn-sm"
              :disabled="form.classes.length >= 3 || totalLevel >= 20"
            >
              <Icon name="heroicons:plus" class="h-4 w-4 mr-2" />
              Add Class (Multiclass)
            </button>

            <div class="text-sm">
              <span class="font-semibold">Total Level:</span>
              <span class="badge badge-lg badge-primary ml-2">{{ totalLevel }}</span>
              <span class="text-base-content/60 ml-1">/ 20</span>
            </div>
          </div>

          <label v-if="errors.classes" class="label">
            <span class="label-text-alt text-error">{{ errors.classes }}</span>
          </label>
        </div>

        <div class="divider"></div>

        <!-- Character Source -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Character Source</h2>

          <div class="form-control">
            <label class="label">
              <span class="label-text">How are you managing this character?</span>
            </label>
            <select v-model="form.characterSource" class="select select-bordered">
              <option value="manual">Manual Entry</option>
              <option value="dndbeyond">D&D Beyond</option>
              <option value="pdf">PDF Character Sheet</option>
            </select>
          </div>

          <div v-if="form.characterSource === 'dndbeyond'" class="form-control mt-4">
            <label class="label">
              <span class="label-text">D&D Beyond Character Link</span>
            </label>
            <input
              v-model="form.dndBeyondLink"
              type="url"
              placeholder="https://www.dndbeyond.com/characters/..."
              class="input input-bordered"
            />
          </div>

          <div v-if="form.characterSource === 'pdf'" class="form-control mt-4">
            <label class="label">
              <span class="label-text">PDF Upload</span>
            </label>
            <div class="alert alert-info">
              <Icon name="heroicons:information-circle" class="h-5 w-5" />
              <span>PDF upload functionality will be available in the full version</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Submit -->
        <div class="card-actions justify-end">
          <button @click="router.back()" type="button" class="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <Icon v-if="!saving" name="heroicons:check" class="h-5 w-5 mr-2" />
            {{ saving ? 'Creating...' : 'Create Character' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CharacterFormData } from '~/types'
import { validateCharacterForm } from '~/utils/validators'

definePageMeta({
  middleware: ['auth', 'player']
})

const router = useRouter()
const { createCharacter } = useCharacters()

const form = ref<CharacterFormData>({
  name: '',
  classes: [{ class: '', level: 1 }],
  race: '',
  background: '',
  characterSource: 'manual',
  dndBeyondLink: '',
  pdfUrl: '',
  gold: 0
})

const errors = ref<Record<string, string>>({})
const errorMessage = ref('')
const saving = ref(false)

const dndClasses = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard', 'Artificer', 'Blood Hunter'
]

const races = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn',
  'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Aasimar',
  'Tabaxi', 'Goliath', 'Firbolg', 'Kenku', 'Triton',
  'Genasi', 'Goblin', 'Kobold', 'Orc', 'Yuan-ti'
]

const backgrounds = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero',
  'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin', 'Knight', 'Pirate',
  'Spy', 'City Watch', 'Cloistered Scholar', 'Courtier', 'Faction Agent'
]

const totalLevel = computed(() => {
  return form.value.classes.reduce((sum, cls) => sum + (cls.level || 0), 0)
})

const addClass = () => {
  if (form.value.classes.length < 3 && totalLevel.value < 20) {
    form.value.classes.push({ class: '', level: 1 })
  }
}

const removeClass = (index: number) => {
  if (form.value.classes.length > 1) {
    form.value.classes.splice(index, 1)
  }
}

const handleSubmit = async () => {
  errors.value = {}
  errorMessage.value = ''

  // Validate form
  const validation = validateCharacterForm(form.value)

  if (!validation.valid) {
    errors.value = validation.errors
    errorMessage.value = 'Please fix the errors in the form'
    return
  }

  saving.value = true

  try {
    const newCharacter = createCharacter(form.value)

    // Success - redirect to character detail
    await router.push(`/characters/${newCharacter.id}`)
  } catch (error: any) {
    console.error('Character creation error:', error)
    errorMessage.value = error.message || 'Failed to create character'
  } finally {
    saving.value = false
  }
}
</script>
