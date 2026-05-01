<template>
  <div>
    <div class="section-header">
      <div class="section-title">Dining Tables</div>
    </div>

    <div v-if="loading" class="empty-state">Loading tables…</div>
    <div v-else-if="!tables.length" class="empty-state">No tables found.</div>
    <div v-else class="table-grid">
      <div
        v-for="table in tables"
        :key="table.id"
        :class="['table-card', statusClass(table.status)]"
      >
        <div class="table-number">Table {{ table.id }}</div>
        <div class="table-status">{{ table.status }}</div>
        <div class="table-qr" v-if="table.qrCode">QR: {{ table.qrCode }}</div>
      </div>
    </div>

    <div class="legend">
      <span class="leg-item leg-available">🟢 Available</span>
      <span class="leg-item leg-occupied">🔴 Occupied</span>
      <span class="leg-item leg-reserved">🟡 Reserved</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/request'

interface DiningTable { id: number; status: string; qrCode: string | null }

const tables = ref<DiningTable[]>([])
const loading = ref(false)
const RESTAURANT_ID = 1

function statusClass(status: string) {
  if (status === 'AVAILABLE') return 'status-available'
  if (status === 'OCCUPIED') return 'status-occupied'
  return 'status-reserved'
}

onMounted(async () => {
  loading.value = true
  try {
    tables.value = await api.get<DiningTable[]>(`/tables/restaurant/${RESTAURANT_ID}`)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.table-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
.table-card { border-radius: 12px; padding: 20px; text-align: center; border: 2px solid transparent; }
.table-number { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.table-status { font-size: 12px; font-weight: 600; }
.table-qr { font-size: 10px; color: #7e89ac; margin-top: 6px; }
.status-available { background: #14532d33; border-color: #22c55e; }
.status-available .table-status { color: #22c55e; }
.status-occupied { background: #450a0a33; border-color: #ef4444; }
.status-occupied .table-status { color: #ef4444; }
.status-reserved { background: #451a0333; border-color: #f59e0b; }
.status-reserved .table-status { color: #f59e0b; }
.legend { display: flex; gap: 24px; }
.leg-item { font-size: 13px; color: #aeb9e1; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
</style>
