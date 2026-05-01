<template>
  <div>
    <div class="section-title">Audit Log</div>

    <DataTable
      v-model:search="search"
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="logs"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      search-placeholder="Search by user…"
      @update:search="onSearch"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
    >
      <template #filters>
        <select v-model="entityFilter" class="filter-select" @change="onFilter">
          <option value="">All Entities</option>
          <option v-for="e in entityTypes" :key="e" :value="e">{{ e }}</option>
        </select>
        <select v-model="actionFilter" class="filter-select" @change="onFilter">
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </template>

      <template #cell-action="{ value }">
        <span :class="['action-badge', actionClass(value)]">{{ value }}</span>
      </template>

      <template #cell-entityType="{ value }">
        <span class="badge">{{ value }}</span>
      </template>

      <template #cell-performedAt="{ value }">
        {{ formatDate(value) }}
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/request'
import DataTable from '@/components/DataTable.vue'

interface PageResponse<T> { content: T[]; totalPages: number; totalElements: number }
interface AuditLog { id: number; entityType: string; entityId: number; action: string; performedBy: string; details: string; performedAt: string }

const entityTypes = ['ORDER', 'PAYMENT', 'MENU_ITEM', 'MENU_CATEGORY', 'RESTAURANT', 'TABLE', 'USER']
const columns = [
  { key: 'id', label: '#' },
  { key: 'entityType', label: 'Entity' },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'action', label: 'Action' },
  { key: 'performedBy', label: 'Performed By' },
  { key: 'details', label: 'Details' },
  { key: 'performedAt', label: 'Date & Time' },
]

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const search = ref('')
const entityFilter = ref('')
const actionFilter = ref('')
const page = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

let searchTimer: ReturnType<typeof setTimeout>

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), size: String(pageSize.value) })
    if (entityFilter.value) params.set('entityType', entityFilter.value)
    if (actionFilter.value) params.set('action', actionFilter.value)
    if (search.value) params.set('performedBy', search.value)

    const res = await api.get<PageResponse<AuditLog>>(`/audit-logs?${params}`)
    logs.value = res.content
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

function actionClass(action: string) {
  if (action === 'CREATE') return 'action-create'
  if (action === 'DELETE') return 'action-delete'
  return 'action-update'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

onMounted(load)
</script>

<style scoped>
.section-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.action-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.action-create { background: #14532d; color: #22c55e; }
.action-delete { background: #450a0a; color: #ef4444; }
.action-update { background: #451a03; color: #f59e0b; }
</style>
