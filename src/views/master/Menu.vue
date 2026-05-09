<template>
  <div>
    <!-- Category Section -->
    <div class="section-header">
      <div class="section-title">Menu Categories</div>
      <button class="btn-primary" @click="openCatForm()">+ Add Category</button>
    </div>

    <div v-if="showCatForm" class="form-card">
      <div class="form-row">
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
          <FloatingInput v-model="catForm.name" label="Category name *" />
          <span v-if="catNameError" class="field-error">{{ catNameError }}</span>
        </div>
        <FloatingInput v-model="catForm.description" label="Description (optional)" />
      </div>
      <p v-if="catFormError" class="error-msg">{{ catFormError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submitCategory">{{ catForm.id ? 'Update' : 'Save' }}</button>
        <button class="btn-ghost" @click="showCatForm = false">Cancel</button>
      </div>
    </div>

    <DataTable
      v-model:search="catSearch"
      v-model:currentPage="catPage"
      v-model:pageSize="catPageSize"
      :columns="catColumns"
      :rows="categories"
      :loading="catLoading"
      :totalPages="catTotalPages"
      :totalElements="catTotalElements"
      search-placeholder="Search categories…"
      :sortBy="catSortBy"
      :sortDir="catSortDir"
      @update:search="onCatSearch"
      @update:currentPage="loadCategories"
      @update:pageSize="onCatPageSizeChange"
      @sort="({ sortBy: sb, sortDir: sd }) => { catSortBy = sb; catSortDir = sd; catPage = 0; loadCategories() }"
    >
      <template #rowActions="{ row }">
        <button class="btn-icon" @click="openCatForm(row as MenuCategory)">✏️</button>
        <button class="btn-icon danger" @click="removeCategory(row.id)">🗑️</button>
      </template>
    </DataTable>

    <!-- Menu Items Section -->
    <div class="section-header" style="margin-top: 32px;">
      <div class="section-title">Menu Items</div>
      <button class="btn-primary" @click="openItemForm()">+ Add Item</button>
    </div>

    <div v-if="showItemForm" class="form-card">
      <div class="form-row">
        <FloatingInput v-model="itemForm.name" label="Item name *" />
        <FloatingInput v-model.number="itemForm.price" label="Base Price *" type="number" />
      </div>
      <FloatingInput v-model="itemForm.description" label="Description" />
      <FloatingSelect v-model.number="itemForm.menuCategoryId" label="Category *">
        <option v-for="c in allCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </FloatingSelect>
      <p v-if="itemFormError" class="error-msg">{{ itemFormError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submitItem">{{ itemForm.id ? 'Update' : 'Save' }} Item</button>
        <button class="btn-ghost" @click="showItemForm = false">Cancel</button>
      </div>
    </div>

    <DataTable
      v-model:search="itemSearch"
      v-model:currentPage="itemPage"
      v-model:pageSize="itemPageSize"
      :columns="itemColumns"
      :rows="items"
      :loading="itemLoading"
      :totalPages="itemTotalPages"
      :totalElements="itemTotalElements"
      search-placeholder="Search by item name…"
      :sortBy="itemSortBy"
      :sortDir="itemSortDir"
      @update:search="onItemSearch"
      @update:currentPage="loadItems"
      @update:pageSize="onItemPageSizeChange"
      @sort="({ sortBy: sb, sortDir: sd }) => { itemSortBy = sb; itemSortDir = sd; itemPage = 0; loadItems() }"
    >
      <template #filters>
        <select v-model="filterCategoryId" class="filter-select" @change="onItemFilter">
          <option value="">All Categories</option>
          <option v-for="c in allCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <input v-model.number="filterMinPrice" class="filter-input" type="number" placeholder="Min ₹" @change="onItemFilter" />
        <input v-model.number="filterMaxPrice" class="filter-input" type="number" placeholder="Max ₹" @change="onItemFilter" />
        <button v-if="filterCategoryId || filterMinPrice || filterMaxPrice" class="btn-clear-filter" @click="clearItemFilters">✕ Clear</button>
      </template>
      <template #cell-menuCategoryName="{ value }">
        <span class="badge">{{ value }}</span>
      </template>
      <template #cell-price="{ value }">₹{{ value }}</template>
      <template #rowActions="{ row }">
        <button class="btn-icon" @click="openItemForm(row as MenuItem)">✏️</button>
        <button class="btn-icon danger" @click="removeItem(row.id)">🗑️</button>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import FloatingSelect from '@/components/FloatingSelect.vue'
import { menuService, type MenuCategory, type MenuItem } from '@/services/menu-service'

// ── Category section ──────────────────────────────────────────────────────────
const catColumns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description' },
]

const categories = ref<MenuCategory[]>([])
const allCategories = ref<MenuCategory[]>([])
const catLoading = ref(false)
const showCatForm = ref(false)
const catFormError = ref<string | null>(null)
const catNameError = ref<string | null>(null)
let isInitializingCatForm = false
let catNameTimer: ReturnType<typeof setTimeout>

const catSearch = ref('')
const catSortBy = ref('name')
const catSortDir = ref<'asc' | 'desc'>('asc')
const catPage = ref(0)
const catPageSize = ref(5)
const catTotalPages = ref(0)
const catTotalElements = ref(0)

const blankCatForm = () => ({ id: undefined as number | undefined, name: '', description: '' })
const catForm = reactive(blankCatForm())

function openCatForm(cat?: MenuCategory) {
  catFormError.value = null
  catNameError.value = null
  isInitializingCatForm = true
  Object.assign(catForm, cat
    ? { id: cat.id, name: cat.name, description: cat.description ?? '' }
    : blankCatForm())
  showCatForm.value = true
  nextTick(() => { isInitializingCatForm = false })
}

watch(() => catForm.name, (val) => {
  if (isInitializingCatForm) return
  catNameError.value = null
  clearTimeout(catNameTimer)
  if (!val || !val.trim()) return
  catNameTimer = setTimeout(async () => {
    try {
      const res = await menuService.checkDuplicateCategoryName(val.trim(), catForm.id)
      if (res.data) catNameError.value = 'This category name already exists'
    } catch {}
  }, 400)
})

async function submitCategory() {
  if (!catForm.name.trim()) { catFormError.value = 'Category name is required'; return }
  if (catNameError.value) return
  catFormError.value = null
  try {
    await menuService.saveCategory({ id: catForm.id, name: catForm.name, description: catForm.description || undefined })
    showCatForm.value = false
    catPage.value = 0
    await Promise.all([loadCategories(), loadAllCategories()])
  } catch (e: any) {
    catFormError.value = e.message
  }
}

async function removeCategory(id: number) {
  if (!confirm('Delete this category?')) return
  try {
    await menuService.deleteCategory(id)
    await Promise.all([loadCategories(), loadAllCategories()])
  } catch (e: any) {
    alert(e.message)
  }
}

async function loadCategories() {
  catLoading.value = true
  try {
    const res = await menuService.filterCategories({
      page: catPage.value, size: catPageSize.value,
      sortBy: catSortBy.value, sortDir: catSortDir.value,
      name: catSearch.value || undefined,
    })
    categories.value = res.data.content
    catTotalPages.value = res.data.totalPages
    catTotalElements.value = res.data.totalElements
  } finally {
    catLoading.value = false
  }
}

async function loadAllCategories() {
  const res = await menuService.getAllCategories()
  allCategories.value = res.data
}

let catSearchTimer: ReturnType<typeof setTimeout>
function onCatSearch() {
  clearTimeout(catSearchTimer)
  catSearchTimer = setTimeout(() => { catPage.value = 0; loadCategories() }, 350)
}
function onCatPageSizeChange() { catPage.value = 0; loadCategories() }

// ── Menu Items section ────────────────────────────────────────────────────────
const itemColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'menuCategoryName', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Base Price', sortable: true },
]

const items = ref<MenuItem[]>([])
const itemLoading = ref(false)
const showItemForm = ref(false)
const itemFormError = ref<string | null>(null)

const itemSearch = ref('')
const filterCategoryId = ref<number | ''>('')
const filterMinPrice = ref<number | undefined>(undefined)
const filterMaxPrice = ref<number | undefined>(undefined)
const itemSortBy = ref('name')
const itemSortDir = ref<'asc' | 'desc'>('asc')
const itemPage = ref(0)
const itemPageSize = ref(5)
const itemTotalPages = ref(0)
const itemTotalElements = ref(0)

const blankItemForm = () => ({
  id: undefined as number | undefined,
  name: '', description: '', price: 0,
  menuCategoryId: '' as number | '',
})
const itemForm = reactive(blankItemForm())

function openItemForm(item?: MenuItem) {
  itemFormError.value = null
  Object.assign(itemForm, item
    ? { id: item.id, name: item.name, description: item.description ?? '', price: item.price, menuCategoryId: item.menuCategoryId }
    : blankItemForm())
  showItemForm.value = true
}

async function submitItem() {
  if (!itemForm.name || !itemForm.price || !itemForm.menuCategoryId) {
    itemFormError.value = 'Name, price and category are required'; return
  }
  itemFormError.value = null
  try {
    await menuService.saveItem({
      id: itemForm.id,
      menuCategoryId: itemForm.menuCategoryId as number,
      name: itemForm.name, description: itemForm.description || undefined,
      price: itemForm.price,
    })
    showItemForm.value = false
    itemPage.value = 0
    await loadItems()
  } catch (e: any) {
    itemFormError.value = e.message
  }
}

async function removeItem(id: number) {
  if (!confirm('Delete this menu item?')) return
  try {
    await menuService.deleteItem(id)
    await loadItems()
  } catch (e: any) {
    alert(e.message)
  }
}

async function loadItems() {
  itemLoading.value = true
  try {
    const res = await menuService.filterItems({
      page: itemPage.value, size: itemPageSize.value,
      sortBy: itemSortBy.value, sortDir: itemSortDir.value,
      name: itemSearch.value || undefined,
      menuCategoryId: filterCategoryId.value || undefined,
      minPrice: filterMinPrice.value || undefined,
      maxPrice: filterMaxPrice.value || undefined,
    })
    items.value = res.data.content
    itemTotalPages.value = res.data.totalPages
    itemTotalElements.value = res.data.totalElements
  } finally {
    itemLoading.value = false
  }
}

let itemSearchTimer: ReturnType<typeof setTimeout>
function onItemSearch() {
  clearTimeout(itemSearchTimer)
  itemSearchTimer = setTimeout(() => { itemPage.value = 0; loadItems() }, 350)
}
function onItemFilter() { itemPage.value = 0; loadItems() }
function onItemPageSizeChange() { itemPage.value = 0; loadItems() }
function clearItemFilters() { filterCategoryId.value = ''; filterMinPrice.value = undefined; filterMaxPrice.value = undefined; itemPage.value = 0; loadItems() }

onMounted(async () => {
  await loadAllCategories()
  await Promise.all([loadCategories(), loadItems()])
})
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.7; }
.btn-icon.danger:hover { opacity: 1; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-toggle { display: flex; align-items: center; gap: 8px; color: #aeb9e1; font-size: 14px; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }
.field-error { color: #ef4444; font-size: 11px; padding-left: 14px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.filter-input { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none; width: 90px; }
.filter-input:focus { border-color: #6c72ff; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.avail-yes { color: #22c55e; font-size: 12px; font-weight: 600; }
.avail-no { color: #ef4444; font-size: 12px; font-weight: 600; }
</style>
