<template>
  <div class="admin-shell">
    <SideBar />
    <div class="admin-main">
      <NavBar :title="pageTitle" />
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" @update:title="pageTitle = $event" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import SideBar from '@/components/SideBar.vue'
import NavBar from '@/components/NavBar.vue'

const pageTitle = ref('Dashboard')
</script>

<style scoped>
.admin-shell { display: flex; min-height: 100vh; background: #080f25; }
.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.admin-content { flex: 1; overflow-y: auto; padding: 24px; }
</style>
