<template>
  <div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ orderStore.orders.length }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingOrders }}</div>
          <div class="stat-label">Pending Orders</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍔</div>
        <div class="stat-info">
          <div class="stat-value">{{ menuStore.items.length }}</div>
          <div class="stat-label">Menu Items</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">₹{{ totalRevenue }}</div>
          <div class="stat-label">Today's Revenue</div>
        </div>
      </div>
    </div>

    <div class="section-title">Recent Orders</div>
    <div v-if="orderStore.loading" class="empty-state">Loading orders…</div>
    <div v-else-if="!orderStore.orders.length" class="empty-state">No orders yet.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.customerName ?? 'Walk-in' }}</td>
            <td><span class="badge">{{ order.orderType }}</span></td>
            <td>{{ order.items.length }}</td>
            <td>₹{{ order.totalAmount }}</td>
            <td><span :class="['status-badge', statusClass(order.orderStatus)]">{{ order.orderStatus }}</span></td>
            <td>
              <select class="status-select" :value="order.orderStatus" @change="(e) => changeStatus(order.id, (e.target as HTMLSelectElement).value)">
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useMenuStore } from '@/stores/menu'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

const statuses = ['PENDING','CONFIRMED','PREPARING','READY','SERVED','COMPLETED','CANCELLED']

const pendingOrders = computed(() =>
  orderStore.orders.filter(o => ['PENDING','CONFIRMED','PREPARING'].includes(o.orderStatus)).length
)
const totalRevenue = computed(() =>
  orderStore.orders
    .filter(o => o.orderStatus === 'COMPLETED')
    .reduce((s, o) => s + o.totalAmount, 0)
    .toFixed(0)
)
const recentOrders = computed(() => [...orderStore.orders].slice(0, 10))

function statusClass(status: string) {
  if (['COMPLETED'].includes(status)) return 'status-green'
  if (['CANCELLED'].includes(status)) return 'status-red'
  if (['PREPARING', 'READY'].includes(status)) return 'status-yellow'
  return 'status-blue'
}

async function changeStatus(id: number, status: string) {
  await orderStore.updateStatus(id, status)
}

onMounted(async () => {
  await Promise.all([orderStore.fetchByRestaurant(), menuStore.fetchAll()])
})
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #212c4d; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
.stat-icon { font-size: 32px; }
.stat-value { font-size: 28px; font-weight: 700; color: #fff; }
.stat-label { font-size: 13px; color: #aeb9e1; margin-top: 2px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.table-wrap { background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.badge { background: #37446b; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.status-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.status-green { background: #14532d; color: #22c55e; }
.status-red { background: #450a0a; color: #ef4444; }
.status-yellow { background: #451a03; color: #f59e0b; }
.status-blue { background: #1e3a5f; color: #57c3ff; }
.status-select { background: #37446b; border: none; color: #fff; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
