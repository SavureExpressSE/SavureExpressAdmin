<template>
  <div>
    <div class="section-title">Payments</div>

    <DataTable
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="payments"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
    >
      <template #filters>
        <select v-model="statusFilter" class="filter-select" @change="onFilter">
          <option value="">All Statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="methodFilter" class="filter-select" @change="onFilter">
          <option value="">All Methods</option>
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>
      </template>

      <template #cell-paymentStatus="{ value }">
        <span :class="['status-badge', statusClass(value)]">{{ value }}</span>
      </template>

      <template #cell-amount="{ value }">₹{{ value }}</template>

      <template #rowActions="{ row }">
        <select
          v-if="row.paymentStatus === 'PENDING'"
          class="status-select"
          :value="row.paymentStatus"
          @change="(e) => changeStatus(row.id, (e.target as HTMLSelectElement).value)"
        >
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <span v-else class="locked-label">—</span>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'

interface Payment {
  id: number
  orderId: number
  amount: number
  paymentMethod: string
  paymentStatus: string
  initiatedBy: string
  createdAt: string
}

const authStore = useAuthStore()
const restaurantId = computed(() => authStore.restaurantId ?? 1)

const statuses = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']
const methods = ['CASH', 'CARD', 'UPI', 'WALLET']

const columns = [
  { key: 'id', label: '#' },
  { key: 'orderId', label: 'Order' },
  { key: 'paymentMethod', label: 'Method' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentStatus', label: 'Status' },
  { key: 'initiatedBy', label: 'Initiated By' },
]

const payments = ref<Payment[]>([])
const loading = ref(false)
const statusFilter = ref('')
const methodFilter = ref('')
const page = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

async function load() {
  loading.value = true
  try {
    const all = await api.get<Payment[]>(`/payments/restaurant/${restaurantId.value}`)
    let filtered = all
    if (statusFilter.value) filtered = filtered.filter(p => p.paymentStatus === statusFilter.value)
    if (methodFilter.value) filtered = filtered.filter(p => p.paymentMethod === methodFilter.value)
    totalElements.value = filtered.length
    totalPages.value = Math.ceil(filtered.length / pageSize.value)
    const start = page.value * pageSize.value
    payments.value = filtered.slice(start, start + pageSize.value)
  } finally {
    loading.value = false
  }
}

function onFilter() { page.value = 0; load() }
function onPageSizeChange() { page.value = 0; load() }

function statusClass(status: string) {
  if (status === 'SUCCESS') return 'status-green'
  if (status === 'FAILED') return 'status-red'
  if (status === 'REFUNDED') return 'status-yellow'
  return 'status-blue'
}

async function changeStatus(id: number, status: string) {
  await api.patch(`/payments/${id}/status?status=${status}`)
  await load()
}

onMounted(load)
</script>

<style scoped>
.section-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.status-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.status-green { background: #14532d; color: #22c55e; }
.status-red { background: #450a0a; color: #ef4444; }
.status-yellow { background: #451a03; color: #f59e0b; }
.status-blue { background: #1e3a5f; color: #57c3ff; }
.status-select { background: #37446b; border: none; color: #fff; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
.locked-label { color: #4a5580; font-size: 12px; }
</style>
