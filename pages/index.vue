<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="card bg-primary text-primary-content">
      <div class="card-body">
        <h1 class="card-title text-3xl">
          <Icon name="game-icons:d12" class="h-8 w-8" />
          Welcome, {{ currentUser?.name }}!
        </h1>
        <p>{{ welcomeMessage }}</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="route.query.error" class="alert alert-error">
      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" />
      <span>{{ getErrorMessage(route.query.error as string) }}</span>
    </div>

    <!-- Player View -->
    <div v-if="isPlayer && !isAdmin && !isDM">
      <h2 class="text-2xl font-bold mb-4">My Characters</h2>

      <div v-if="myCharacters.length === 0" class="card bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <Icon name="heroicons:user-plus" class="h-16 w-16 mx-auto text-base-content/30" />
          <h3 class="text-xl font-semibold">No characters yet</h3>
          <p class="text-base-content/70">Create your first character to start tracking your Adventure League progress!</p>
          <div class="card-actions justify-center mt-4">
            <NuxtLink to="/characters/new" class="btn btn-primary">
              <Icon name="heroicons:plus" class="h-5 w-5 mr-2" />
              Create Character
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <CharacterCard
            v-for="character in myCharacters"
            :key="character.id"
            :character="character"
          />
        </div>

        <div class="flex justify-center">
          <NuxtLink to="/characters/new" class="btn btn-primary">
            <Icon name="heroicons:plus" class="h-5 w-5 mr-2" />
            Create New Character
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- DM View -->
    <div v-if="isDM && !isAdmin" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-primary">
            <Icon name="heroicons:user-group" class="h-8 w-8" />
          </div>
          <div class="stat-title">Total Characters</div>
          <div class="stat-value text-primary">{{ allCharacters.length }}</div>
        </div>

        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-secondary">
            <Icon name="heroicons:gift" class="h-8 w-8" />
          </div>
          <div class="stat-title">Recent Loot Awarded</div>
          <div class="stat-value text-secondary">{{ recentVouchers.length }}</div>
        </div>

        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-accent">
            <Icon name="heroicons:calendar" class="h-8 w-8" />
          </div>
          <div class="stat-title">Recent Sessions</div>
          <div class="stat-value text-accent">{{ uniqueSessions.length }}</div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Quick Actions</h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink to="/dm/award" class="btn btn-primary">
              <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
              Award Loot/Attendance
            </NuxtLink>
            <NuxtLink to="/characters" class="btn btn-secondary">
              <Icon name="heroicons:user-group" class="h-5 w-5 mr-2" />
              View All Characters
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Recent Awards</h3>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item/Session</th>
                  <th>Awarded At</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recentActivity" :key="item.id">
                  <td>
                    <span class="badge" :class="item.type === 'loot' ? 'badge-primary' : 'badge-secondary'">
                      {{ item.type }}
                    </span>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ formatDate(item.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin View -->
    <div v-if="isAdmin" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-primary">
            <Icon name="heroicons:users" class="h-8 w-8" />
          </div>
          <div class="stat-title">Total Users</div>
          <div class="stat-value text-primary">{{ allUsers.length }}</div>
        </div>

        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-secondary">
            <Icon name="heroicons:user-group" class="h-8 w-8" />
          </div>
          <div class="stat-title">Total Characters</div>
          <div class="stat-value text-secondary">{{ allCharacters.length }}</div>
        </div>

        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-accent">
            <Icon name="heroicons:gift" class="h-8 w-8" />
          </div>
          <div class="stat-title">Total Loot</div>
          <div class="stat-value text-accent">{{ allVouchers.length }}</div>
        </div>

        <div class="stat bg-base-100 shadow rounded-box">
          <div class="stat-figure text-info">
            <Icon name="heroicons:calendar" class="h-8 w-8" />
          </div>
          <div class="stat-title">Attendance Records</div>
          <div class="stat-value text-info">{{ allTokens.length }}</div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Quick Actions</h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink to="/admin" class="btn btn-primary">
              <Icon name="heroicons:cog-6-tooth" class="h-5 w-5 mr-2" />
              Admin Panel
            </NuxtLink>
            <NuxtLink to="/players" class="btn btn-secondary">
              <Icon name="heroicons:users" class="h-5 w-5 mr-2" />
              Manage Users
            </NuxtLink>
            <NuxtLink to="/dm/award" class="btn btn-accent">
              <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
              Award Loot/Attendance
            </NuxtLink>
            <NuxtLink to="/characters" class="btn btn-info">
              <Icon name="heroicons:user-group" class="h-5 w-5 mr-2" />
              View All Characters
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const { currentUser, isPlayer, isDM, isAdmin } = useAuth()
const { myCharacters, allCharacters } = useCharacters()
const { recentVouchers, allVouchers } = useLootVouchers()
const { recentTokens, uniqueSessions, allTokens } = useAttendance()
const authStore = useAuthStore()

const allUsers = computed(() => authStore.getActiveUsers())

const welcomeMessage = computed(() => {
  if (isAdmin.value) {
    return 'System Administrator Dashboard'
  } else if (isDM.value) {
    return 'Dungeon Master Dashboard'
  } else {
    return 'Track your Adventure League characters, loot, and attendance'
  }
})

const recentActivity = computed(() => {
  const loot = recentVouchers.value.map(v => ({
    id: v.id,
    type: 'loot',
    name: v.name,
    date: v.awardedAt
  }))

  const attendance = recentTokens.value.map(t => ({
    id: t.id,
    type: 'attendance',
    name: t.sessionName,
    date: t.awardedAt
  }))

  return [...loot, ...attendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getErrorMessage = (error: string) => {
  const messages: Record<string, string> = {
    dm_required: 'You need DM or Admin privileges to access that page',
    admin_required: 'You need Admin privileges to access that page'
  }

  return messages[error] || 'An error occurred'
}
</script>
