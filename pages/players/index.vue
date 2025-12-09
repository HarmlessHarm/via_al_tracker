<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">
        <Icon name="heroicons:users" class="h-8 w-8 inline mr-2" />
        User Management
      </h1>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <Icon name="heroicons:check-circle" class="h-5 w-5" />
      <span>{{ successMessage }}</span>
    </div>

    <!-- Users Table -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">All Users</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Characters</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="font-semibold">{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" :class="roleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ getUserCharacterCount(user.id) }}</td>
                <td>
                  <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-sm btn-ghost">
                      <Icon name="heroicons:ellipsis-vertical" class="h-5 w-5" />
                    </label>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li v-if="user.role === 'player'">
                        <a @click="promoteToRole(user.id, 'dm')">
                          <Icon name="heroicons:arrow-up" class="h-4 w-4" />
                          Promote to DM
                        </a>
                      </li>
                      <li v-if="user.role === 'dm'">
                        <a @click="promoteToRole(user.id, 'admin')">
                          <Icon name="heroicons:arrow-up" class="h-4 w-4" />
                          Promote to Admin
                        </a>
                      </li>
                      <li v-if="user.role !== 'player'">
                        <a @click="promoteToRole(user.id, 'player')">
                          <Icon name="heroicons:arrow-down" class="h-4 w-4" />
                          Demote to Player
                        </a>
                      </li>
                      <li v-if="user.id !== currentUser?.id">
                        <a @click="handleDeleteUser(user.id)" class="text-error">
                          <Icon name="heroicons:trash" class="h-4 w-4" />
                          Delete User
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Stats by Role -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-info">
          <Icon name="heroicons:user" class="h-8 w-8" />
        </div>
        <div class="stat-title">Players</div>
        <div class="stat-value text-info">{{ players.length }}</div>
      </div>

      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-warning">
          <Icon name="heroicons:shield-check" class="h-8 w-8" />
        </div>
        <div class="stat-title">Dungeon Masters</div>
        <div class="stat-value text-warning">{{ dms.length }}</div>
      </div>

      <div class="stat bg-base-100 shadow rounded-box">
        <div class="stat-figure text-error">
          <Icon name="heroicons:cog-6-tooth" class="h-8 w-8" />
        </div>
        <div class="stat-title">Administrators</div>
        <div class="stat-value text-error">{{ admins.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types'

definePageMeta({
  middleware: ['auth', 'admin']
})

const { currentUser } = useAuth()
const authStore = useAuthStore()
const { allCharacters } = useCharacters()

const successMessage = ref('')

const users = computed(() => authStore.getActiveUsers())
const players = computed(() => authStore.getUsersByRole('player'))
const dms = computed(() => authStore.getUsersByRole('dm'))
const admins = computed(() => authStore.getUsersByRole('admin'))

const roleBadgeClass = (role: UserRole) => {
  const classes: Record<UserRole, string> = {
    admin: 'badge-error',
    dm: 'badge-warning',
    player: 'badge-info'
  }
  return classes[role]
}

const getUserCharacterCount = (userId: string) => {
  return allCharacters.value.filter(c => c.playerId === userId).length
}

const promoteToRole = (userId: string, newRole: UserRole) => {
  const user = authStore.getUserById(userId)

  if (!user) return

  if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
    authStore.updateUserRole(userId, newRole)
    successMessage.value = `${user.name} is now a ${newRole}`

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

const handleDeleteUser = (userId: string) => {
  const user = authStore.getUserById(userId)

  if (!user) return

  if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
    authStore.deleteUser(userId)
    successMessage.value = `${user.name} has been deleted`

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}
</script>
