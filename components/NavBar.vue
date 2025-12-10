<template>
  <div class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <Icon name="heroicons:bars-3" class="h-5 w-5" />
        </label>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li v-if="isAuthenticated">
            <NuxtLink to="/">Dashboard</NuxtLink>
          </li>
          <li v-if="isAuthenticated">
            <NuxtLink to="/characters">My Characters</NuxtLink>
          </li>
          <li v-if="isDM">
            <NuxtLink to="/dm/award">DM Tools</NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/admin">Admin Panel</NuxtLink>
          </li>
        </ul>
      </div>
      <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
        <Icon name="game-icons:d12" class="h-6 w-6 mr-2" />
        AL Tracker
      </NuxtLink>
    </div>

    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1" v-if="isAuthenticated">
        <li>
          <NuxtLink to="/" class="smooth-transition">
            <Icon name="heroicons:home" class="h-5 w-5" />
            Dashboard
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/characters" class="smooth-transition">
            <Icon name="heroicons:user-group" class="h-5 w-5" />
            My Characters
          </NuxtLink>
        </li>
        <li v-if="isDM">
          <NuxtLink to="/dm/award" class="smooth-transition">
            <Icon name="heroicons:gift" class="h-5 w-5" />
            DM Tools
          </NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/admin" class="smooth-transition">
            <Icon name="heroicons:cog-6-tooth" class="h-5 w-5" />
            Admin
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="navbar-end">
      <UserMenu v-if="isAuthenticated" />
      <NuxtLink v-else to="/login" class="btn btn-primary">
        Login
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, isDM, isAdmin } = useAuth()
</script>
