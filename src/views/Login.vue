<template>
  <h2 class="text-neutral-white text-xl font-semibold mb-6">Login</h2>
  <form @submit.prevent="login">
    <!-- Email -->
    <div class="mb-4">
      <label class="block text-neutral-lighter text-sm mb-2">Email</label>
      <input
        v-model="email"
        class="w-full p-3 rounded-lg bg-neutral-base text-white focus:ring-2 focus:ring-primary outline-none"
        placeholder="Enter your email"
        type="email"
      />
    </div>

    <!-- Password -->
    <div class="mb-4">
      <label class="block text-neutral-lighter text-sm mb-2">Password</label>
      <input
        v-model="password"
        class="w-full p-3 rounded-lg bg-neutral-base text-white focus:ring-2 focus:ring-primary outline-none"
        placeholder="Enter your password"
        type="password"
      />
    </div>

    <!-- Error -->
    <p v-if="error" style="color:#ef4444;font-size:13px;margin-bottom:12px;">{{ error }}</p>

    <!-- Button -->
    <button
      class="w-full bg-primary hover:bg-secondary-accent text-white py-3 rounded-lg transition"
      type="submit"
      :disabled="loading"
      style="opacity: loading ? 0.7 : 1; cursor: loading ? 'not-allowed' : 'pointer'"
    >
      {{ loading ? 'Signing in…' : 'Login' }}
    </button>
  </form>

  <p class="text-neutral-light text-sm text-center mt-4">
    Don’t have an account?
    <router-link class="text-secondary-light hover:underline" to="/register"> Sign up </router-link>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

async function login() {
  if (!email.value || !password.value) { error.value = 'Please enter email and password'; return }
  error.value = null
  loading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
