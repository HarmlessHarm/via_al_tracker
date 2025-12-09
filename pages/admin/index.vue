<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">
      <Icon name="heroicons:cog-6-tooth" class="h-8 w-8 inline mr-2" />
      Admin Panel
    </h1>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-primary">
          <Icon name="heroicons:users" class="h-8 w-8" />
        </div>
        <div class="stat-title">Total Users</div>
        <div class="stat-value text-primary">{{ users.length }}</div>
        <div class="stat-desc">{{ players.length }} players, {{ dms.length }} DMs, {{ admins.length }} admins</div>
      </div>

      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-secondary">
          <Icon name="heroicons:user-group" class="h-8 w-8" />
        </div>
        <div class="stat-title">Total Characters</div>
        <div class="stat-value text-secondary">{{ allCharacters.length }}</div>
        <div class="stat-desc">Across all players</div>
      </div>

      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-accent">
          <Icon name="heroicons:gift" class="h-8 w-8" />
        </div>
        <div class="stat-title">Loot Vouchers</div>
        <div class="stat-value text-accent">{{ allVouchers.length }}</div>
        <div class="stat-desc">{{ unusedVouchersCount }} unused</div>
      </div>

      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-info">
          <Icon name="heroicons:calendar" class="h-8 w-8" />
        </div>
        <div class="stat-title">Sessions</div>
        <div class="stat-value text-info">{{ uniqueSessions.length }}</div>
        <div class="stat-desc">{{ allTokens.length }} total attendance</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Quick Actions</h2>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/players" class="btn btn-primary">
            <Icon name="heroicons:users" class="h-5 w-5 mr-2" />
            Manage Users
          </NuxtLink>
          <NuxtLink to="/characters" class="btn btn-secondary">
            <Icon name="heroicons:user-group" class="h-5 w-5 mr-2" />
            View All Characters
          </NuxtLink>
          <NuxtLink to="/dm/award" class="btn btn-accent">
            <Icon name="heroicons:gift" class="h-5 w-5 mr-2" />
            Award Loot/Attendance
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Recent Activity</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Type</th>
                <th>Details</th>
                <th>User/Character</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in recentActivity" :key="`${activity.type}-${activity.id}`">
                <td>
                  <span class="badge" :class="activityBadgeClass(activity.type)">
                    {{ activity.type }}
                  </span>
                </td>
                <td>{{ activity.details }}</td>
                <td>{{ activity.target }}</td>
                <td class="text-sm text-base-content/60">{{ formatDate(activity.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Most Active Players -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Most Active Players</h2>

        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Characters</th>
                <th>Loot Vouchers</th>
                <th>Sessions Attended</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in mostActivePlayer" :key="player.id">
                <td class="font-semibold">{{ player.name }}</td>
                <td>{{ player.characterCount }}</td>
                <td>{{ player.lootCount }}</td>
                <td>{{ player.attendanceCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

const authStore = useAuthStore()
const { allCharacters } = useCharacters()
const { allVouchers } = useLootVouchers()
const { allTokens, uniqueSessions } = useAttendance()

const users = computed(() => authStore.getActiveUsers())
const players = computed(() => authStore.getUsersByRole('player'))
const dms = computed(() => authStore.getUsersByRole('dm'))
const admins = computed(() => authStore.getUsersByRole('admin'))

const unusedVouchersCount = computed(() => {
  return allVouchers.value.filter(v => !v.isUsed).length
})

const recentActivity = computed(() => {
  const activities: any[] = []

  // Recent characters
  const recentChars = allCharacters.value
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  recentChars.forEach(char => {
    const player = authStore.getUserById(char.playerId)
    activities.push({
      id: char.id,
      type: 'character',
      details: `Created ${char.name}`,
      target: player?.name || 'Unknown',
      date: char.createdAt
    })
  })

  // Recent loot
  const recentLoot = allVouchers.value
    .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
    .slice(0, 3)

  recentLoot.forEach(voucher => {
    const char = allCharacters.value.find(c => c.id === voucher.characterId)
    const dm = authStore.getUserById(voucher.awardedBy)
    activities.push({
      id: voucher.id,
      type: 'loot',
      details: `${dm?.name || 'DM'} awarded ${voucher.name}`,
      target: char?.name || 'Unknown',
      date: voucher.awardedAt
    })
  })

  // Recent attendance
  const recentAttendance = allTokens.value
    .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
    .slice(0, 3)

  recentAttendance.forEach(token => {
    const char = allCharacters.value.find(c => c.id === token.characterId)
    activities.push({
      id: token.id,
      type: 'attendance',
      details: token.sessionName,
      target: char?.name || 'Unknown',
      date: token.awardedAt
    })
  })

  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
})

const mostActivePlayer = computed(() => {
  return players.value.map(player => {
    const playerChars = allCharacters.value.filter(c => c.playerId === player.id)
    const charIds = playerChars.map(c => c.id)

    const lootCount = allVouchers.value.filter(v => charIds.includes(v.characterId)).length
    const attendanceCount = allTokens.value.filter(t => charIds.includes(t.characterId)).length

    return {
      id: player.id,
      name: player.name,
      characterCount: playerChars.length,
      lootCount,
      attendanceCount
    }
  })
    .sort((a, b) => b.attendanceCount - a.attendanceCount)
    .slice(0, 5)
})

const activityBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    character: 'badge-info',
    loot: 'badge-primary',
    attendance: 'badge-secondary'
  }
  return classes[type] || 'badge-ghost'
}

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
