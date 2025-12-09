<template>
  <div v-if="character" class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="btn btn-ghost btn-circle">
          <Icon name="heroicons:arrow-left" class="h-6 w-6" />
        </button>
        <div>
          <h1 class="text-3xl font-bold">{{ character.name }}</h1>
          <p class="text-base-content/70">{{ character.race }} | {{ character.background }}</p>
        </div>
      </div>

      <div class="badge badge-lg badge-primary">
        Level {{ character.totalLevel }}
      </div>
    </div>

    <!-- Character Overview -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Character Overview</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat bg-base-200 rounded-box">
            <div class="stat-title">Classes</div>
            <div class="stat-value text-2xl">
              <div class="flex flex-wrap gap-2">
                <div v-for="(cls, index) in character.classes" :key="index" class="badge badge-primary badge-lg">
                  {{ cls.class }} {{ cls.level }}
                </div>
              </div>
            </div>
          </div>

          <div class="stat bg-base-200 rounded-box">
            <div class="stat-figure text-warning">
              <Icon name="heroicons:currency-dollar" class="h-8 w-8" />
            </div>
            <div class="stat-title">Gold</div>
            <div class="stat-value text-warning">{{ character.gold }}</div>
            <div class="stat-desc">gp</div>
          </div>

          <div class="stat bg-base-200 rounded-box">
            <div class="stat-figure text-info">
              <Icon name="heroicons:document-text" class="h-8 w-8" />
            </div>
            <div class="stat-title">Character Source</div>
            <div class="stat-value text-2xl">
              <div class="badge badge-lg" :class="sourceClass">
                {{ sourceLabel }}
              </div>
            </div>
            <div v-if="character.dndBeyondLink" class="stat-desc">
              <a :href="character.dndBeyondLink" target="_blank" class="link link-primary">
                View on D&D Beyond
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs tabs-boxed bg-base-100 shadow-xl p-2">
      <a
        class="tab"
        :class="{ 'tab-active': activeTab === 'loot' }"
        @click="activeTab = 'loot'"
      >
        <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
        Loot Vouchers ({{ voucherCount.unused }})
      </a>
      <a
        class="tab"
        :class="{ 'tab-active': activeTab === 'attendance' }"
        @click="activeTab = 'attendance'"
      >
        <Icon name="heroicons:calendar" class="h-5 w-5 mr-2" />
        Attendance ({{ attendanceTokens.length }})
      </a>
    </div>

    <!-- Loot Vouchers Tab -->
    <div v-show="activeTab === 'loot'" class="space-y-4">
      <div v-if="lootVouchers.length === 0" class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <Icon name="heroicons:gift" class="h-16 w-16 mx-auto text-base-content/30" />
          <h3 class="text-xl font-semibold">No loot vouchers yet</h3>
          <p class="text-base-content/70">Loot vouchers awarded by DMs will appear here</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="voucher in lootVouchers"
          :key="voucher.id"
          class="card bg-base-100 shadow-xl border-l-4"
          :class="`rarity-${voucher.rarity}`"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <h3 class="card-title">{{ voucher.name }}</h3>
              <div class="badge" :class="rarityBadgeClass(voucher.rarity)">
                {{ voucher.rarity.replace('_', ' ') }}
              </div>
            </div>

            <p class="text-sm text-base-content/70">{{ voucher.description }}</p>

            <div class="card-actions justify-between items-center mt-2">
              <div class="text-xs text-base-content/60">
                {{ formatDate(voucher.awardedAt) }}
              </div>

              <div v-if="voucher.isUsed" class="badge badge-ghost">
                Used {{ formatDate(voucher.usedAt!) }}
              </div>
              <button
                v-else
                @click="handleUseVoucher(voucher.id)"
                class="btn btn-sm btn-primary"
              >
                Mark as Used
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Tab -->
    <div v-show="activeTab === 'attendance'" class="space-y-4">
      <div v-if="attendanceTokens.length === 0" class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <Icon name="heroicons:calendar" class="h-16 w-16 mx-auto text-base-content/30" />
          <h3 class="text-xl font-semibold">No attendance records yet</h3>
          <p class="text-base-content/70">Session attendance tracked by DMs will appear here</p>
        </div>
      </div>

      <div v-else class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Session History</h3>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Awarded</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in attendanceTokens" :key="token.id">
                  <td>{{ token.sessionName }}</td>
                  <td>{{ formatSessionDate(token.sessionDate) }}</td>
                  <td class="text-xs text-base-content/60">{{ formatDate(token.awardedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <Icon name="heroicons:exclamation-triangle" class="h-16 w-16 mx-auto text-base-content/30" />
    <h2 class="text-2xl font-bold mt-4">Character not found</h2>
    <p class="text-base-content/70 mt-2">The character you're looking for doesn't exist or you don't have permission to view it.</p>
    <button @click="router.push('/characters')" class="btn btn-primary mt-4">
      Back to Characters
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const { getCharacter } = useCharacters()
const { getCharacterVouchers, useVoucher, getVoucherCount } = useLootVouchers()
const { getCharacterTokens } = useAttendance()

const characterId = route.params.id as string
const character = computed(() => getCharacter(characterId))
const lootVouchers = computed(() => getCharacterVouchers(characterId))
const attendanceTokens = computed(() => getCharacterTokens(characterId))
const voucherCount = computed(() => getVoucherCount(characterId))

const activeTab = ref<'loot' | 'attendance'>('loot')

const sourceLabel = computed(() => {
  if (!character.value) return ''

  const labels = {
    manual: 'Manual',
    dndbeyond: 'D&D Beyond',
    pdf: 'PDF'
  }

  return labels[character.value.characterSource]
})

const sourceClass = computed(() => {
  if (!character.value) return ''

  const classes = {
    manual: 'badge-ghost',
    dndbeyond: 'badge-info',
    pdf: 'badge-warning'
  }

  return classes[character.value.characterSource]
})

const rarityBadgeClass = (rarity: string) => {
  const classes: Record<string, string> = {
    common: 'badge-ghost',
    uncommon: 'badge-success',
    rare: 'badge-info',
    very_rare: 'badge-secondary',
    legendary: 'badge-warning'
  }

  return classes[rarity] || 'badge-ghost'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatSessionDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleUseVoucher = (voucherId: string) => {
  if (confirm('Mark this loot voucher as used?')) {
    useVoucher(voucherId)
  }
}
</script>
