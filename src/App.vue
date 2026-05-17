<template>
  <RouterView />
  <ConfirmDialog />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.init() // sync — wires request.ts callbacks before any child mounts

onMounted(async () => {
  await authStore.tryRestoreSession() // restore session from HttpOnly cookie on page load/refresh
})
</script>
