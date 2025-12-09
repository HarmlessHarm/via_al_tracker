<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold">
      <Icon name="heroicons:gift" class="h-8 w-8 inline mr-2" />
      DM Award Panel
    </h1>

    <div v-if="successMessage" class="alert alert-success">
      <Icon name="heroicons:check-circle" class="h-5 w-5" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Award Type Tabs -->
    <div class="tabs tabs-boxed bg-base-100 shadow-xl p-2">
      <a
        class="tab"
        :class="{ 'tab-active': awardType === 'loot' }"
        @click="awardType = 'loot'"
      >
        <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
        Award Loot Voucher
      </a>
      <a
        class="tab"
        :class="{ 'tab-active': awardType === 'attendance' }"
        @click="awardType = 'attendance'"
      >
        <Icon name="heroicons:calendar" class="h-5 w-5 mr-2" />
        Award Attendance
      </a>
    </div>

    <!-- Loot Voucher Form -->
    <div v-show="awardType === 'loot'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Award Loot Voucher</h2>

        <form @submit.prevent="handleAwardLoot" class="space-y-4">
          <!-- Character Search/Select -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Search Character</span>
            </label>
            <input
              v-model="characterSearch"
              type="text"
              placeholder="Search by character or player name..."
              class="input input-bordered"
              @input="handleCharacterSearch"
            />

            <div v-if="filteredCharacters.length > 0 && characterSearch" class="mt-2 max-h-48 overflow-y-auto border border-base-300 rounded-lg">
              <div
                v-for="char in filteredCharacters"
                :key="char.id"
                @click="selectCharacter(char)"
                class="p-3 hover:bg-base-200 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <div class="font-semibold">{{ char.name }}</div>
                  <div class="text-sm text-base-content/60">
                    {{ char.race }} | Level {{ char.totalLevel }} | {{ getPlayerName(char.playerId) }}
                  </div>
                </div>
                <div class="badge badge-primary">Select</div>
              </div>
            </div>
          </div>

          <div v-if="selectedCharacter" class="alert alert-info">
            <Icon name="heroicons:information-circle" class="h-5 w-5" />
            <span>Awarding to: <strong>{{ selectedCharacter.name }}</strong></span>
            <button @click="clearSelection" type="button" class="btn btn-sm btn-ghost">
              Change
            </button>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Loot Name *</span>
            </label>
            <input
              v-model="lootForm.name"
              type="text"
              placeholder="e.g., Potion of Greater Healing"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Description *</span>
            </label>
            <textarea
              v-model="lootForm.description"
              placeholder="Describe the loot voucher..."
              class="textarea textarea-bordered"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Rarity *</span>
            </label>
            <select v-model="lootForm.rarity" class="select select-bordered" required>
              <option value="">Select rarity</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="very_rare">Very Rare</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <div class="card-actions justify-end">
            <button type="submit" class="btn btn-primary" :disabled="!selectedCharacter || awarding">
              <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
              {{ awarding ? 'Awarding...' : 'Award Loot Voucher' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Attendance Form -->
    <div v-show="awardType === 'attendance'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Award Attendance Token</h2>

        <form @submit.prevent="handleAwardAttendance" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Session Name *</span>
            </label>
            <input
              v-model="attendanceForm.sessionName"
              type="text"
              placeholder="e.g., Dragon of Icespire Peak - Session 1"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Session Date *</span>
            </label>
            <input
              v-model="attendanceForm.sessionDate"
              type="date"
              class="input input-bordered"
              required
            />
          </div>

          <div class="divider">Select Characters</div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Search Characters</span>
            </label>
            <input
              v-model="bulkSearch"
              type="text"
              placeholder="Search characters..."
              class="input input-bordered"
            />
          </div>

          <div class="max-h-96 overflow-y-auto border border-base-300 rounded-lg p-2">
            <div
              v-for="char in bulkFilteredCharacters"
              :key="char.id"
              class="form-control"
            >
              <label class="label cursor-pointer justify-start gap-4 p-2 hover:bg-base-200 rounded">
                <input
                  type="checkbox"
                  :value="char.id"
                  v-model="selectedCharacterIds"
                  class="checkbox checkbox-primary"
                />
                <div>
                  <div class="font-semibold">{{ char.name }}</div>
                  <div class="text-sm text-base-content/60">
                    {{ char.race }} | Level {{ char.totalLevel }} | {{ getPlayerName(char.playerId) }}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="selectedCharacterIds.length > 0" class="alert alert-info">
            <Icon name="heroicons:information-circle" class="h-5 w-5" />
            <span>{{ selectedCharacterIds.length }} character(s) selected</span>
          </div>

          <div class="card-actions justify-end">
            <button type="submit" class="btn btn-primary" :disabled="selectedCharacterIds.length === 0 || awarding">
              <Icon name="heroicons:calendar" class="h-5 w-5 mr-2" />
              {{ awarding ? 'Awarding...' : `Award to ${selectedCharacterIds.length} Character(s)` }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Recent Awards -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Recent Awards</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Type</th>
                <th>Item/Session</th>
                <th>Character</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="award in recentAwards" :key="`${award.type}-${award.id}`">
                <td>
                  <span class="badge" :class="award.type === 'loot' ? 'badge-primary' : 'badge-secondary'">
                    {{ award.type }}
                  </span>
                </td>
                <td>{{ award.name }}</td>
                <td>{{ award.characterName }}</td>
                <td class="text-sm text-base-content/60">{{ formatDate(award.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CharacterWithTotalLevel, LootRarity } from '~/types'

definePageMeta({
  middleware: ['auth', 'dm']
})

const { allCharacters } = useCharacters()
const { awardVoucher, recentVouchers } = useLootVouchers()
const { awardToken, awardTokensBulk, recentTokens } = useAttendance()
const authStore = useAuthStore()

const awardType = ref<'loot' | 'attendance'>('loot')
const successMessage = ref('')
const errorMessage = ref('')
const awarding = ref(false)

// Loot form
const characterSearch = ref('')
const selectedCharacter = ref<CharacterWithTotalLevel | null>(null)
const filteredCharacters = ref<CharacterWithTotalLevel[]>([])

const lootForm = ref({
  name: '',
  description: '',
  rarity: '' as LootRarity | ''
})

// Attendance form
const attendanceForm = ref({
  sessionName: '',
  sessionDate: new Date().toISOString().split('T')[0]
})

const bulkSearch = ref('')
const selectedCharacterIds = ref<string[]>([])

const bulkFilteredCharacters = computed(() => {
  if (!bulkSearch.value.trim()) return allCharacters.value

  const query = bulkSearch.value.toLowerCase()
  return allCharacters.value.filter(char =>
    char.name.toLowerCase().includes(query) ||
    char.race.toLowerCase().includes(query) ||
    getPlayerName(char.playerId).toLowerCase().includes(query)
  )
})

const handleCharacterSearch = () => {
  if (!characterSearch.value.trim()) {
    filteredCharacters.value = []
    return
  }

  const query = characterSearch.value.toLowerCase()
  filteredCharacters.value = allCharacters.value.filter(char =>
    char.name.toLowerCase().includes(query) ||
    char.race.toLowerCase().includes(query) ||
    getPlayerName(char.playerId).toLowerCase().includes(query)
  ).slice(0, 5)
}

const selectCharacter = (char: CharacterWithTotalLevel) => {
  selectedCharacter.value = char
  characterSearch.value = char.name
  filteredCharacters.value = []
}

const clearSelection = () => {
  selectedCharacter.value = null
  characterSearch.value = ''
  filteredCharacters.value = []
}

const getPlayerName = (playerId: string) => {
  const user = authStore.getUserById(playerId)
  return user?.name || 'Unknown'
}

const handleAwardLoot = async () => {
  if (!selectedCharacter.value) return

  errorMessage.value = ''
  awarding.value = true

  try {
    awardVoucher({
      characterId: selectedCharacter.value.id,
      name: lootForm.value.name,
      description: lootForm.value.description,
      rarity: lootForm.value.rarity as LootRarity
    })

    successMessage.value = `Awarded "${lootForm.value.name}" to ${selectedCharacter.value.name}!`

    // Reset form
    lootForm.value = {
      name: '',
      description: '',
      rarity: ''
    }
    clearSelection()

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to award loot voucher'
  } finally {
    awarding.value = false
  }
}

const handleAwardAttendance = async () => {
  errorMessage.value = ''
  awarding.value = true

  try {
    awardTokensBulk(
      selectedCharacterIds.value,
      attendanceForm.value.sessionName,
      attendanceForm.value.sessionDate
    )

    successMessage.value = `Awarded attendance to ${selectedCharacterIds.value.length} character(s)!`

    // Reset form
    attendanceForm.value = {
      sessionName: '',
      sessionDate: new Date().toISOString().split('T')[0]
    }
    selectedCharacterIds.value = []

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to award attendance'
  } finally {
    awarding.value = false
  }
}

const recentAwards = computed(() => {
  const loot = recentVouchers.value.map(v => {
    const char = allCharacters.value.find(c => c.id === v.characterId)
    return {
      id: v.id,
      type: 'loot',
      name: v.name,
      characterName: char?.name || 'Unknown',
      date: v.awardedAt
    }
  })

  const attendance = recentTokens.value.map(t => {
    const char = allCharacters.value.find(c => c.id === t.characterId)
    return {
      id: t.id,
      type: 'attendance',
      name: t.sessionName,
      characterName: char?.name || 'Unknown',
      date: t.awardedAt
    }
  })

  return [...loot, ...attendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
