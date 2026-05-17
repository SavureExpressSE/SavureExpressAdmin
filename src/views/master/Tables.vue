<template>
  <div>
    <div class="section-header">
      <div class="section-title">Dining Tables</div>
    </div>

    <DataTable
      v-model:search="search"
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="tables"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      search-placeholder="Search by QR code…"
      :sortBy="sortBy"
      :sortDir="sortDir"
      @update:search="onSearch"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
      @sort="({ sortBy: sb, sortDir: sd }) => { sortBy = sb; sortDir = sd; page = 0; load() }"
    >
      <template #filters>
        <select v-model.number="filterRestaurantId" class="filter-select" @change="onFilter">
          <option value="">All Restaurants</option>
          <option v-for="r in allRestaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select" @change="onFilter">
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="RESERVED">Reserved</option>
        </select>
        <button v-if="filterRestaurantId || filterStatus" class="btn-clear-filter" @click="clearFilters">✕ Clear</button>
      </template>

      <template #cell-status="{ row, value }">
        <select :value="value" class="status-select" @change="(e) => changeStatus(row.id, (e.target as HTMLSelectElement).value)">
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="RESERVED">RESERVED</option>
        </select>
      </template>

      <template #cell-qrCode="{ value }">
        <span class="qr-val">{{ value ?? '—' }}</span>
      </template>

      <template #rowActions="{ row }">
        <button class="btn-icon danger" @click="remove(row.id)">🗑️</button>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import DataTable from '@/components/DataTable.vue'
import { tableService, type DiningTable } from '@/services/table-service'
import { restaurantService, type Restaurant } from '@/services/restaurant-service'

const columns = [
  { key: 'id', label: 'Table #', sortable: true },
  { key: 'restaurantName', label: 'Restaurant', sortable: true },
  { key: 'qrCode', label: 'QR Code' },
  { key: 'status', label: 'Status', sortable: true },
]

const tables = ref<DiningTable[]>([])
const allRestaurants = ref<Restaurant[]>([])
const { confirm } = useConfirm()

const loading = ref(false)

const search = ref('')
const filterRestaurantId = ref<number | ''>('')
const filterStatus = ref('')
const sortBy = ref('id')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await tableService.filter({
      page: page.value, size: pageSize.value,
      sortBy: sortBy.value, sortDir: sortDir.value,
      restaurantId: filterRestaurantId.value || undefined,
      status: filterStatus.value || undefined,
      qrCode: search.value || undefined,
    })
    tables.value = res.data.content
    totalPages.value = res.data.totalPages
    totalElements.value = res.data.totalElements
  } finally {
    loading.value = false
  }
}

async function changeStatus(id: number, status: string) {
  try {
    await tableService.updateStatus(id, status)
    await load()
  } catch (e: any) {
    alert(e.message)
  }
}

async function remove(id: number) {
  if (!await confirm('Delete this table?')) return
  try {
    await tableService.delete(id)
    await load()
  } catch (e: any) {
    alert(e.message)
  }
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 0; load() }, 350)
}
function onFilter() { page.value = 0; load() }
function onPageSizeChange() { page.value = 0; load() }
function clearFilters() { filterRestaurantId.value = ''; filterStatus.value = ''; page.value = 0; load() }

onMounted(async () => {
  const res = await restaurantService.getAll()
  allRestaurants.value = Array.isArray(res) ? res : (res as any).data ?? []
  await load()
})
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.7; }
.btn-icon.danger:hover { opacity: 1; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.status-select { background: #2a3a5e; border: 1px solid #4a5580; border-radius: 6px; padding: 4px 8px; color: #fff; font-size: 12px; cursor: pointer; outline: none; }
.status-select:focus { border-color: #6c72ff; }
.qr-val { font-size: 12px; color: #7e89ac; font-family: monospace; }
</style>
