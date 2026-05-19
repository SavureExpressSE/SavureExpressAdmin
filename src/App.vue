<template>
  <RouterView />
  <ConfirmDialog />
</template>

<script lang="ts" setup>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'

// Wire request.ts callbacks synchronously before any child mounts or navigation guards run
useAuthStore().init()
</script>
