<template>
  <div class="dt-wrapper">
    <!-- Toolbar -->
    <div class="dt-toolbar">
      <div class="dt-search">
        <span class="search-icon">🔍</span>
        <input
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          class="search-input"
          :placeholder="searchPlaceholder || 'Search…'"
        />
        <button v-if="search" class="search-clear" @click="$emit('update:search', '')">✕</button>
      </div>
      <div class="dt-filters"><slot name="filters" /></div>
      <div class="dt-actions"><slot name="actions" /></div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <div v-if="loading" class="empty-state">Loading…</div>
      <div v-else-if="!rows.length" class="empty-state">{{ emptyText || 'No records found.' }}</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="$slots.rowActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ row[col.key] ?? '—' }}</slot>
            </td>
            <td v-if="$slots.rowActions"><slot name="rowActions" :row="row" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="(totalPages ?? 0) > 1" class="dt-pagination">
      <span class="page-info">Page {{ (currentPage ?? 0) + 1 }} of {{ totalPages }} · {{ totalElements }} records</span>
      <div class="page-btns">
        <button class="page-btn" :disabled="currentPage === 0" @click="$emit('update:currentPage', 0)">«</button>
        <button class="page-btn" :disabled="currentPage === 0" @click="$emit('update:currentPage', (currentPage ?? 0) - 1)">‹</button>
        <button v-for="p in visiblePages" :key="p" :class="['page-btn', p === currentPage && 'page-btn--active']" @click="$emit('update:currentPage', p)">{{ p + 1 }}</button>
        <button class="page-btn" :disabled="(currentPage ?? 0) >= (totalPages ?? 1) - 1" @click="$emit('update:currentPage', (currentPage ?? 0) + 1)">›</button>
        <button class="page-btn" :disabled="(currentPage ?? 0) >= (totalPages ?? 1) - 1" @click="$emit('update:currentPage', (totalPages ?? 1) - 1)">»</button>
      </div>
      <select class="page-size-select" :value="pageSize" @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))">
        <option v-for="s in [10, 20, 50]" :key="s" :value="s">{{ s }} / page</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  columns: { key: string; label: string }[]
  rows: Record<string, any>[]
  loading?: boolean
  search?: string
  searchPlaceholder?: string
  emptyText?: string
  currentPage?: number
  pageSize?: number
  totalPages?: number
  totalElements?: number
}>()

defineEmits<{
  'update:search': [value: string]
  'update:currentPage': [value: number]
  'update:pageSize': [value: number]
}>()

const visiblePages = computed(() => {
  const total = props.totalPages ?? 1
  const cur = props.currentPage ?? 0
  const pages: number[] = []
  for (let i = Math.max(0, cur - 2); i <= Math.min(total - 1, cur + 2); i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.dt-wrapper { display: flex; flex-direction: column; gap: 12px; }
.dt-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.dt-search { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; font-size: 14px; pointer-events: none; }
.search-input { background: #212c4d; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 30px 8px 32px; color: #fff; font-size: 13px; outline: none; width: 220px; }
.search-input:focus { border-color: #6c72ff; }
.search-clear { position: absolute; right: 8px; background: none; border: none; color: #aeb9e1; cursor: pointer; font-size: 12px; }
.dt-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.dt-actions { margin-left: auto; display: flex; gap: 8px; }
.table-wrap { background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; white-space: nowrap; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #263356; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
.dt-pagination { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.page-info { font-size: 13px; color: #aeb9e1; }
.page-btns { display: flex; gap: 4px; margin-left: auto; }
.page-btn { background: #212c4d; border: 1px solid #37446b; color: #aeb9e1; border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { background: #37446b; color: #fff; }
.page-btn--active { background: #6c72ff; border-color: #6c72ff; color: #fff; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-size-select { background: #212c4d; border: 1px solid #37446b; color: #aeb9e1; border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; }
</style>
