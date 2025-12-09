<template>
  <div class="min-h-screen bg-base-200">
    <NavBar />

    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
      <div>
        <p>D&D Adventure League Tracker - POC {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Initialize stores on app mount
onMounted(() => {
  const authStore = useAuthStore()
  const charactersStore = useCharactersStore()
  const lootStore = useLootVouchersStore()
  const attendanceStore = useAttendanceStore()

  // Initialize all stores with fixture data if needed
  authStore.initialize()
  charactersStore.initialize()
  lootStore.initialize()
  attendanceStore.initialize()
})
</script>

<style>
html {
  height: 100%;
}

body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

#__nuxt {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
