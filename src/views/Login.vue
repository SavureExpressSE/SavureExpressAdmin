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

    <!-- Button -->
    <button
      class="w-full bg-primary hover:bg-secondary-accent text-white py-3 rounded-lg transition"
      type="submit"
    >
      Login
    </button>
  </form>

  <p class="text-neutral-light text-sm text-center mt-4">
    Don’t have an account?
    <router-link class="text-secondary-light hover:underline" to="/register"> Sign up </router-link>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

function login() {
  console.log('Logging in with', email.value, password.value)
}
</script>
