<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">🍽️</span>
      <span class="logo-text">Savure<br /><strong>Express</strong></span>
    </div>

    <nav class="nav">
      <div v-for="group in navGroups" :key="group.label" class="nav-group">
        <div class="nav-group-label">{{ group.label }}</div>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="handleLogout">🚪 Logout</button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isAdminOrOwner = computed(() => ['ADMIN', 'OWNER'].includes(authStore.role ?? ''))

const allGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    ],
    adminOnly: false,
  },
  {
    label: 'Operations',
    items: [
      { to: '/orders', icon: '📋', label: 'Orders' },
      { to: '/reports', icon: '📈', label: 'Reports' },
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
      { to: '/audit-log', icon: '🔍', label: 'Audit Log' },
    ],
    adminOnly: false,
  },
  {
    label: 'Master Data',
    items: [
      { to: '/master/restaurant', icon: '🏪', label: 'Restaurants' },
      { to: '/master/menu', icon: '🍔', label: 'Menu' },
      { to: '/master/staff', icon: '👥', label: 'Staff' },
      { to: '/master/locations', icon: '🌍', label: 'Locations' },
    ],
    adminOnly: true,
  },
]

const navGroups = computed(() => allGroups.filter(g => !g.adminOnly || isAdminOrOwner.value))

function handleLogout() {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
.sidebar { width: 220px; min-height: 100vh; background: #212c4d; display: flex; flex-direction: column; flex-shrink: 0; }
.logo { display: flex; align-items: center; gap: 12px; padding: 24px 20px; border-bottom: 1px solid #37446b; }
.logo-icon { font-size: 28px; }
.logo-text { color: #fff; font-size: 14px; line-height: 1.3; }
.logo-text strong { color: #6c72ff; font-size: 16px; }
.nav { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.nav-group { margin-bottom: 8px; }
.nav-group-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5580; padding: 8px 12px 4px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #aeb9e1; text-decoration: none; font-size: 14px; transition: all 0.2s; }
.nav-item:hover { background: #37446b; color: #fff; }
.nav-item--active { background: #6c72ff; color: #fff; }
.nav-icon { font-size: 18px; }
.sidebar-footer { padding: 16px 12px; border-top: 1px solid #37446b; }
.logout-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: transparent; border: 1px solid #37446b; border-radius: 8px; color: #aeb9e1; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.logout-btn:hover { background: #ef4444; border-color: #ef4444; color: #fff; }
</style>
