<template>
  <div>
    <div class="section-title">Orders</div>

    <DataTable
      v-model:search="search"
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="orders"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      search-placeholder="Search by order ID…"
      @update:search="onSearch"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
    >
      <template #filters>
        <select v-model="statusFilter" class="filter-select" @change="onFilter">
          <option value="">All Statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="typeFilter" class="filter-select" @change="onFilter">
          <option value="">All Types</option>
          <option value="DINE_IN">DINE_IN</option>
          <option value="WALK_IN">WALK_IN</option>
        </select>
      </template>

      <template #cell-orderType="{ value }">
        <span class="badge">{{ value }}</span>
      </template>

      <template #cell-orderStatus="{ value }">
        <span :class="['status-badge', statusClass(value)]">{{ value }}</span>
      </template>

      <template #cell-totalAmount="{ value }">₹{{ value }}</template>

      <template #cell-customerName="{ value }">{{ value || 'Walk-in' }}</template>

      <template #rowActions="{ row }">
        <select class="status-select" :value="row.orderStatus" @change="(e) => changeStatus(row.id, (e.target as HTMLSelectElement).value)">
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/request'
import DataTable from '@/components/DataTable.vue'

interface PageResponse<T> { content: T[]; totalPages: number; totalElements: number; number: number }
interface Order { id: number; customerName: string | null; orderType: string; orderStatus: string; totalAmount: number; items: any[] }

const RESTAURANT_ID = 1
const statuses = ['PENDING','CONFIRMED','PREPARING','READY','SERVED','COMPLETED','CANCELLED']
const columns = [
  { key: 'id', label: '#' },
  { key: 'customerName', label: 'Customer' },
  { key: 'orderType', label: 'Type' },
  { key: 'orderStatus', label: 'Status' },
  { key: 'totalAmount', label: 'Total' },
]

const orders = ref<Order[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)

let searchTimer: ReturnType<typeof setTimeout>

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      size: String(pageSize.value),
    })
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (typeFilter.value) params.set('orderType', typeFilter.value)
    if (search.value) params.set('search', search.value)

    const res = await api.get<PageResponse<Order>>(`/orders/restaurant/${RESTAURANT_ID}/search?${params}`)
    orders.value = res.content
    totalPages.value = res.totalPages
    totalElements.value = res.totalElements
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 0; load() }, 350)
}

function onFilter() { page.value = 0; load() }

function onPageSizeChange() { page.value = 0; load() }

function statusClass(status: string) {
  if (status === 'COMPLETED') return 'status-green'
  if (status === 'CANCELLED') return 'status-red'
  if (['PREPARING', 'READY'].includes(status)) return 'status-yellow'
  return 'status-blue'
}

async function changeStatus(id: number, status: string) {
  await api.patch(`/orders/${id}/status?status=${status}`)
  await load()
}

onMounted(load)
</script>

<style scoped>
.section-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.badge { background: #37446b; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.status-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.status-green { background: #14532d; color: #22c55e; }
.status-red { background: #450a0a; color: #ef4444; }
.status-yellow { background: #451a03; color: #f59e0b; }
.status-blue { background: #1e3a5f; color: #57c3ff; }
.status-select { background: #37446b; border: none; color: #fff; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
</style>
