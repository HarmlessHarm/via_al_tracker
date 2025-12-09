<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-16rem)]">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl font-bold text-center justify-center mb-4">
          <Icon name="game-icons:d12" class="h-8 w-8 mr-2" />
          AL Tracker Login
        </h2>

        <div v-if="errorMessage" class="alert alert-error">
          <Icon name="heroicons:exclamation-triangle" class="h-5 w-5" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="player@al.local"
              class="input input-bordered"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="Enter your password"
              class="input input-bordered"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :class="{ loading }" :disabled="loading">
              <Icon v-if="!loading" name="heroicons:arrow-right-on-rectangle" class="h-5 w-5 mr-2" />
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>

        <div class="divider">Test Credentials</div>

        <div class="space-y-2">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div class="collapse-title text-sm font-medium">
              Quick Login Options
            </div>
            <div class="collapse-content text-sm space-y-2">
              <div class="grid grid-cols-1 gap-2">
                <button @click="quickLogin('admin')" class="btn btn-sm btn-outline">
                  Admin (admin@al.local / admin123)
                </button>
                <button @click="quickLogin('dm')" class="btn btn-sm btn-outline">
                  DM (dm@al.local / dm123)
                </button>
                <button @click="quickLogin('player1')" class="btn btn-sm btn-outline">
                  Player 1 (player1@al.local / player123)
                </button>
                <button @click="quickLogin('player2')" class="btn btn-sm btn-outline">
                  Player 2 (player2@al.local / player123)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFixtureCredentials } from '~/utils/fixtures'

definePageMeta({
  layout: false
})

const { login, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

const loginForm = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await login(loginForm.value.email, loginForm.value.password)

    if (!result.success) {
      errorMessage.value = result.message || 'Login failed'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

const quickLogin = (userType: 'admin' | 'dm' | 'player1' | 'player2') => {
  const credentials = getFixtureCredentials()[userType]
  loginForm.value.email = credentials.email
  loginForm.value.password = credentials.password
  handleLogin()
}
</script>
