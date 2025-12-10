<template>
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
      <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
        <span class="text-xl">{{ userInitials }}</span>
      </div>
    </label>
    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
      <li class="menu-title">
        <span>{{ currentUser?.name }}</span>
        <span class="badge badge-sm" :class="roleBadgeClass">{{ currentUser?.role }}</span>
      </li>
      <li>
        <NuxtLink to="/profile">
          <Icon name="heroicons:user-circle" class="h-4 w-4" />
          Profile
        </NuxtLink>
      </li>
      <li>
        <a @click="handleLogout">
          <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
          Logout
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { currentUser, logout } = useAuth()

const userInitials = computed(() => {
  if (!currentUser.value?.name) return '?'
  return currentUser.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const roleBadgeClass = computed(() => {
  switch (currentUser.value?.role) {
    case 'admin':
      return 'badge-error'
    case 'dm':
      return 'badge-warning'
    case 'player':
      return 'badge-info'
    default:
      return 'badge-ghost'
  }
})

const handleLogout = async () => {
  await logout()
}
</script>
