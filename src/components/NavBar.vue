<template>
  <header class="navbar">
    <h2 class="page-title">{{ title }}</h2>
    <div class="navbar-right">
      <span class="role-badge">{{ authStore.role }}</span>
      <div class="user-info">
        <span>👤</span>
        <span class="user-email">{{ authStore.email }}</span>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
defineProps<{ title: string }>()
const authStore = useAuthStore()
</script>

<style scoped>
.navbar { height: 60px; background: #212c4d; border-bottom: 1px solid #37446b; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; }
.page-title { color: #fff; font-size: 18px; font-weight: 600; margin: 0; }
.navbar-right { display: flex; align-items: center; gap: 16px; }
.role-badge { background: #6c72ff; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.user-info { display: flex; align-items: center; gap: 8px; }
.user-email { color: #aeb9e1; font-size: 13px; }
</style>
