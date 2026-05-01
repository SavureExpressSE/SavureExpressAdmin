import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'Login', component: () => import('@/views/Login.vue') },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        // Overview
        { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
        // Operations
        { path: 'orders', name: 'Orders', component: () => import('@/views/Orders.vue') },
        { path: 'reports', name: 'Reports', component: () => import('@/views/Reports.vue') },
        { path: 'notifications', name: 'Notifications', component: () => import('@/views/Notifications.vue') },
        { path: 'audit-log', name: 'AuditLog', component: () => import('@/views/AuditLog.vue') },
        // Master Data
        { path: 'master/restaurant', name: 'MasterRestaurant', component: () => import('@/views/master/Restaurant.vue') },
        { path: 'master/menu', name: 'MasterMenu', component: () => import('@/views/master/Menu.vue') },
        { path: 'master/tables', name: 'MasterTables', component: () => import('@/views/master/Tables.vue') },
        { path: 'master/staff', name: 'MasterStaff', component: () => import('@/views/master/Staff.vue') },
        { path: 'master/locations', name: 'MasterLocations', component: () => import('@/views/master/Locations.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'Login' }
  }
  if (to.name === 'Login' && token) {
    return { name: 'Dashboard' }
  }
})

export default router
