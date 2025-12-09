<template>
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
      <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
        <span class="text-xl">{{ userInitials }}</span>
      </div>
    </label>
    <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
      <li class="menu-title">
        <span>{{ currentUser?.name }}</span>
        <span class="badge badge-sm" :class="roleBadgeClass">{{ roleLabel }}</span>
      </li>
      <li>
        <NuxtLink to="/characters" class="smooth-transition">
          <Icon name="heroicons:user-group" class="h-4 w-4" />
          My Characters
        </NuxtLink>
      </li>
      <li v-if="isDM">
        <NuxtLink to="/dm/award" class="smooth-transition">
          <Icon name="heroicons:gift" class="h-4 w-4" />
          DM Tools
        </NuxtLink>
      </li>
      <li v-if="isAdmin">
        <NuxtLink to="/admin" class="smooth-transition">
          <Icon name="heroicons:cog-6-tooth" class="h-4 w-4" />
          Admin Panel
        </NuxtLink>
      </li>
      <li v-if="isAdmin">
        <NuxtLink to="/players" class="smooth-transition">
          <Icon name="heroicons:users" class="h-4 w-4" />
          Manage Players
        </NuxtLink>
      </li>
      <div class="divider my-0"></div>
      <li>
        <a @click="handleLogout" class="text-error smooth-transition">
          <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
          Logout
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { currentUser, isAdmin, isDM, logout } = useAuth()

const userInitials = computed(() => {
  if (!currentUser.value) return '?'

  const names = currentUser.value.name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return currentUser.value.name[0].toUpperCase()
})

const roleLabel = computed(() => {
  if (!currentUser.value) return ''

  const labels = {
    admin: 'Admin',
    dm: 'DM',
    player: 'Player'
  }

  return labels[currentUser.value.role] || currentUser.value.role
})

const roleBadgeClass = computed(() => {
  if (!currentUser.value) return ''

  const classes = {
    admin: 'badge-error',
    dm: 'badge-warning',
    player: 'badge-info'
  }

  return classes[currentUser.value.role] || ''
})

const handleLogout = async () => {
  await logout()
}
</script>
