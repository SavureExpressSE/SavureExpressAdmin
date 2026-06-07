<template>
  <h2 class="text-neutral-white text-xl font-semibold mb-6">Login</h2>
  <form @submit.prevent="login">
    <!-- Email -->
    <div class="mb-4">
      <FloatingInput v-model="email" label="Email" type="email" />
    </div>

    <!-- Password -->
    <div class="mb-4">
      <FloatingInput v-model="password" label="Password" type="password" />
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
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FloatingInput from '@/components/FloatingInput.vue'

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
