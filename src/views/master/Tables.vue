<template>
  <div>
    <div class="section-header">
      <div class="section-title">Dining Tables</div>
      <button class="btn-primary" @click="addTable">+ Add Table</button>
    </div>

    <div v-if="loading" class="empty-state">Loading tables…</div>
    <div v-else-if="!tables.length" class="empty-state">No tables found. Add your first table.</div>
    <div v-else class="table-grid">
      <div v-for="table in tables" :key="table.id" :class="['table-card', statusClass(table.status)]">
        <div class="table-number">Table {{ table.id }}</div>
        <div class="table-status">{{ table.status }}</div>
        <div class="table-qr" v-if="table.qrCode">{{ table.qrCode }}</div>
        <div class="table-actions">
          <select class="status-select" :value="table.status" @change="(e) => changeStatus(table.id, (e.target as HTMLSelectElement).value)">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn-del" @click="remove(table.id)">🗑️</button>
        </div>
      </div>
    </div>

    <div class="legend">
      <span class="leg-item">🟢 Available</span>
      <span class="leg-item">🔴 Occupied</span>
      <span class="leg-item">🟡 Reserved</span>
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
const statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED']

function statusClass(status: string) {
  if (status === 'AVAILABLE') return 'status-available'
  if (status === 'OCCUPIED') return 'status-occupied'
  return 'status-reserved'
}

async function load() {
  loading.value = true
  try { tables.value = await api.get<DiningTable[]>(`/tables/restaurant/${RESTAURANT_ID}`) }
  finally { loading.value = false }
}

async function addTable() {
  await api.post('/tables', { restaurantId: RESTAURANT_ID })
  await load()
}

async function changeStatus(id: number, status: string) {
  await api.patch(`/tables/${id}/status`, { status })
  await load()
}

async function remove(id: number) {
  if (!confirm('Delete this table?')) return
  await api.delete(`/tables/${id}`)
  await load()
}

onMounted(load)
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.table-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
.table-card { border-radius: 12px; padding: 16px; text-align: center; border: 2px solid transparent; display: flex; flex-direction: column; gap: 8px; }
.table-number { font-size: 16px; font-weight: 700; color: #fff; }
.table-status { font-size: 12px; font-weight: 600; }
.table-qr { font-size: 10px; color: #7e89ac; }
.table-actions { display: flex; gap: 6px; align-items: center; justify-content: center; margin-top: 4px; }
.status-select { background: #37446b; border: none; color: #fff; border-radius: 6px; padding: 4px 6px; font-size: 11px; cursor: pointer; flex: 1; }
.btn-del { background: transparent; border: none; cursor: pointer; font-size: 14px; opacity: 0.6; }
.btn-del:hover { opacity: 1; }
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
