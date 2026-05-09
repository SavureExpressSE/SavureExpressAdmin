<template>
  <div>
    <div class="section-header">
      <div class="section-title">Restaurants / Outlets</div>
      <button class="btn-primary" @click="openForm()">+ Add Outlet</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <FloatingInput v-model="form.name" label="Name *" />
        <FloatingInput v-model="form.code" label="Code * (e.g. REST001)" />
      </div>
      <div class="form-row">
        <FloatingInput v-model="form.email" label="Email *" type="email" />
        <FloatingInput v-model="form.mobile" label="Mobile * (+91XXXXXXXXXX)" />
      </div>
      <div class="form-section-label">Address</div>
      <div class="form-row">
        <FloatingInput v-model="form.address.street" label="Street" />
        <FloatingInput v-model="form.address.city" label="City" />
      </div>
      <div class="form-row">
        <FloatingInput v-model="form.address.state" label="State" />
        <FloatingInput v-model="form.address.zipcode" label="Zipcode" />
        <FloatingInput v-model="form.address.country" label="Country" />
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submit">{{ form.id ? 'Update' : 'Save' }}</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <DataTable
      v-model:search="search"
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="restaurants"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      search-placeholder="Search by name, code, email…"
      :sortBy="sortBy"
      :sortDir="sortDir"
      @update:search="onSearch"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
      @sort="({ sortBy: sb, sortDir: sd }) => { sortBy = sb; sortDir = sd; page = 0; load() }"
    >
      <template #filters>
        <select v-model="filterOutletType" class="filter-select" @change="onFilter">
          <option value="">All Types</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="FOOD_TRUCK">Food Truck</option>
          <option value="BAR">Bar</option>
        </select>
        <select v-model="filterIsActive" class="filter-select" @change="onFilter">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button v-if="filterOutletType || filterIsActive" class="btn-clear-filter" @click="clearFilters">✕ Clear</button>
      </template>

      <template #cell-code="{ value }">
        <span class="badge">{{ value }}</span>
      </template>

      <template #cell-outletType="{ value }">
        <span class="badge-type">{{ value ?? 'RESTAURANT' }}</span>
      </template>

      <template #cell-isActive="{ value }">
        <span :class="value ? 'status-active' : 'status-inactive'">
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>

      <template #rowActions="{ row }">
        <button class="btn-icon" @click="openForm(row)">✏️</button>
        <button class="btn-icon" title="Manage Menu" @click="openMenuPanel((row as Restaurant))">🍔</button>
        <button class="btn-icon" title="Manage Tables" @click="openTablesPanel((row as Restaurant))">🪑</button>
        <button class="btn-icon danger" @click="remove(row.id)">🗑️</button>
      </template>
    </DataTable>

    <!-- Restaurant Menu Panel -->
    <div v-if="menuPanel.restaurantId" class="menu-panel">
      <div class="menu-panel-header">
        <span class="section-title">Menu for {{ menuPanel.restaurantName }}</span>
        <button class="btn-ghost btn-sm" @click="closeMenuPanel">✕ Close</button>
      </div>

      <!-- Add / Edit item form -->
      <div class="menu-item-form">
        <div class="form-row">
          <select v-model.number="menuItemForm.menuItemId" class="form-select" :disabled="!!menuItemForm.id">
            <option value="">Select menu item *</option>
            <optgroup v-for="cat in categoriesWithItems" :key="cat.id" :label="cat.name">
              <option v-for="item in cat.items" :key="item.id" :value="item.id">
                {{ item.name }} (Base ₹{{ item.price }})
              </option>
            </optgroup>
          </select>
          <input v-model.number="menuItemForm.price" class="form-input" type="number" min="0.01" step="0.01" placeholder="Price *" />
          <label class="form-toggle">
            <input v-model="menuItemForm.isAvailable" type="checkbox" />
            <span>Available</span>
          </label>
          <button class="btn-primary btn-sm" @click="saveMenuItem">
            {{ menuItemForm.id ? 'Update' : 'Add' }}
          </button>
          <button v-if="menuItemForm.id" class="btn-ghost btn-sm" @click="resetMenuItemForm">Cancel</button>
        </div>
        <p v-if="menuItemFormError" class="error-msg">{{ menuItemFormError }}</p>
      </div>

      <!-- Configured items list -->
      <div v-if="menuPanel.loading" class="loading-text">Loading…</div>
      <div v-else-if="menuPanel.items.length === 0" class="empty-text">No items configured yet. Add items above.</div>
      <table v-else class="menu-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Item</th>
            <th>Base Price</th>
            <th>Price</th>
            <th>Available</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in menuPanel.items" :key="item.id">
            <td><span class="badge">{{ item.menuCategoryName }}</span></td>
            <td>{{ item.menuItemName }}</td>
            <td class="price-cell">₹{{ item.basePrice }}</td>
            <td class="price-cell">₹{{ item.price }}</td>
            <td>
              <span :class="item.isAvailable ? 'avail-yes' : 'avail-no'">
                {{ item.isAvailable ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-icon" @click="editMenuItem(item)">✏️</button>
              <button class="btn-icon danger" @click="removeMenuItem(item.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Restaurant Tables Panel -->
    <div v-if="tablesPanel.restaurantId" class="menu-panel">
      <div class="menu-panel-header">
        <span class="section-title">Tables for {{ tablesPanel.restaurantName }}</span>
        <button class="btn-ghost btn-sm" @click="closeTablesPanel">✕ Close</button>
      </div>

      <div class="menu-item-form">
        <div class="form-row">
          <input v-model="newTableQr" class="form-input" placeholder="QR Code (optional)" />
          <button class="btn-primary btn-sm" @click="addTable">+ Add Table</button>
        </div>
        <p v-if="tableFormError" class="error-msg">{{ tableFormError }}</p>
      </div>

      <div v-if="tablesPanel.loading" class="loading-text">Loading…</div>
      <div v-else-if="tablesPanel.tables.length === 0" class="empty-text">No tables yet. Add one above.</div>
      <table v-else class="menu-table">
        <thead>
          <tr>
            <th>Table #</th>
            <th>QR Code</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tablesPanel.tables" :key="t.id">
            <td><span class="badge">T{{ t.id }}</span></td>
            <td class="qr-cell">{{ t.qrCode ?? '—' }}</td>
            <td>
              <select :value="t.status" class="status-select" @change="(e) => changeTableStatus(t.id, (e.target as HTMLSelectElement).value)">
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="RESERVED">RESERVED</option>
              </select>
            </td>
            <td class="actions-cell">
              <button class="btn-icon danger" @click="removeTable(t.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import { restaurantService, type Restaurant } from '@/services/restaurant-service'
import { menuService, type RestaurantMenuItem } from '@/services/menu-service'
import type { MenuItem } from '@/services/menu-service'
import { tableService, type DiningTable } from '@/services/table-service'

// ── Restaurant table ──────────────────────────────────────────────────────────
const columns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'code', label: 'Code', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'mobile', label: 'Mobile' },
  { key: 'outletType', label: 'Type', sortable: true },
  { key: 'isActive', label: 'Status' },
]

const restaurants = ref<Restaurant[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)

const search = ref('')
const filterOutletType = ref('')
const filterIsActive = ref('')
const sortBy = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)

const blankForm = () => ({
  id: undefined as number | undefined,
  name: '', code: '', email: '', mobile: '',
  address: { street: '', city: '', state: '', zipcode: '', country: '' },
})
const form = reactive(blankForm())

function openForm(r?: Restaurant) {
  formError.value = null
  if (r) {
    Object.assign(form, { id: r.id, name: r.name, code: r.code, email: r.email, mobile: r.mobile, address: { ...r.address } })
  } else {
    Object.assign(form, blankForm())
  }
  showForm.value = true
}

async function submit() {
  if (!form.name || !form.code || !form.email || !form.mobile) {
    formError.value = 'Name, code, email and mobile are required'
    return
  }
  formError.value = null
  try {
    await restaurantService.save({ id: form.id, name: form.name, code: form.code, email: form.email, mobile: form.mobile, address: form.address })
    showForm.value = false
    page.value = 0
    await load()
  } catch (e: any) {
    formError.value = e.message
  }
}

async function remove(id: number) {
  if (!confirm('Delete this outlet?')) return
  try {
    await restaurantService.delete(id)
    await load()
  } catch (e: any) {
    alert(e.message)
  }
}

async function load() {
  loading.value = true
  try {
    const res = await restaurantService.filter({
      page: page.value,
      size: pageSize.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
      name: search.value || undefined,
      outletType: filterOutletType.value || undefined,
      isActive: filterIsActive.value !== '' ? filterIsActive.value === 'true' : undefined,
    })
    restaurants.value = res.data.content
    totalPages.value = res.data.totalPages
    totalElements.value = res.data.totalElements
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 0; load() }, 350)
}
function onFilter() { page.value = 0; load() }
function onPageSizeChange() { page.value = 0; load() }
function clearFilters() { filterOutletType.value = ''; filterIsActive.value = ''; page.value = 0; load() }

// ── Restaurant Menu Panel ─────────────────────────────────────────────────────
const allGlobalItems = ref<MenuItem[]>([])

const menuPanel = reactive({
  restaurantId: null as number | null,
  restaurantName: '',
  items: [] as RestaurantMenuItem[],
  loading: false,
})

const blankMenuItemForm = () => ({
  id: undefined as number | undefined,
  menuItemId: '' as number | '',
  price: 0,
  isAvailable: true,
})
const menuItemForm = reactive(blankMenuItemForm())
const menuItemFormError = ref<string | null>(null)

const categoriesWithItems = computed(() => {
  const configuredIds = new Set(menuPanel.items.map(i => i.menuItemId))
  const available = menuItemForm.id
    ? allGlobalItems.value
    : allGlobalItems.value.filter(i => !configuredIds.has(i.id))

  const map = new Map<number, { id: number; name: string; items: MenuItem[] }>()
  available.forEach(item => {
    if (!map.has(item.menuCategoryId)) {
      map.set(item.menuCategoryId, { id: item.menuCategoryId, name: item.menuCategoryName, items: [] })
    }
    map.get(item.menuCategoryId)!.items.push(item)
  })
  return Array.from(map.values())
})

async function openMenuPanel(restaurant: Restaurant) {
  menuPanel.restaurantId = restaurant.id
  menuPanel.restaurantName = restaurant.name
  resetMenuItemForm()
  await loadMenuPanel()
  if (allGlobalItems.value.length === 0) {
    const res = await menuService.getAllItems()
    allGlobalItems.value = res.data
  }
}

function closeMenuPanel() {
  menuPanel.restaurantId = null
  menuPanel.restaurantName = ''
  menuPanel.items = []
  resetMenuItemForm()
}

async function loadMenuPanel() {
  if (!menuPanel.restaurantId) return
  menuPanel.loading = true
  try {
    const res = await menuService.getRestaurantMenu(menuPanel.restaurantId)
    menuPanel.items = res.data
  } finally {
    menuPanel.loading = false
  }
}

function resetMenuItemForm() {
  Object.assign(menuItemForm, blankMenuItemForm())
  menuItemFormError.value = null
}

function editMenuItem(item: RestaurantMenuItem) {
  Object.assign(menuItemForm, {
    id: item.id,
    menuItemId: item.menuItemId,
    price: item.price,
    isAvailable: item.isAvailable,
  })
  menuItemFormError.value = null
}

async function saveMenuItem() {
  if (!menuItemForm.menuItemId || !menuItemForm.price) {
    menuItemFormError.value = 'Select an item and set the price'
    return
  }
  menuItemFormError.value = null
  try {
    await menuService.saveRestaurantMenuItem({
      id: menuItemForm.id,
      restaurantId: menuPanel.restaurantId!,
      menuItemId: menuItemForm.menuItemId as number,
      price: menuItemForm.price,
      isAvailable: menuItemForm.isAvailable,
    })
    resetMenuItemForm()
    await loadMenuPanel()
  } catch (e: any) {
    menuItemFormError.value = e.message
  }
}

async function removeMenuItem(id: number) {
  if (!confirm('Remove this item from the restaurant menu?')) return
  try {
    await menuService.deleteRestaurantMenuItem(id)
    await loadMenuPanel()
  } catch (e: any) {
    alert(e.message)
  }
}

// ── Tables Panel ──────────────────────────────────────────────────────────────
const tablesPanel = reactive({
  restaurantId: null as number | null,
  restaurantName: '',
  tables: [] as DiningTable[],
  loading: false,
})
const newTableQr = ref('')
const tableFormError = ref<string | null>(null)

async function openTablesPanel(restaurant: Restaurant) {
  tablesPanel.restaurantId = restaurant.id
  tablesPanel.restaurantName = restaurant.name
  newTableQr.value = ''
  tableFormError.value = null
  await loadTablesPanel()
}

function closeTablesPanel() {
  tablesPanel.restaurantId = null
  tablesPanel.restaurantName = ''
  tablesPanel.tables = []
  newTableQr.value = ''
  tableFormError.value = null
}

async function loadTablesPanel() {
  if (!tablesPanel.restaurantId) return
  tablesPanel.loading = true
  try {
    const res = await tableService.getByRestaurant(tablesPanel.restaurantId)
    tablesPanel.tables = res.data
  } finally {
    tablesPanel.loading = false
  }
}

async function addTable() {
  tableFormError.value = null
  try {
    await tableService.create(tablesPanel.restaurantId!, newTableQr.value || undefined)
    newTableQr.value = ''
    await loadTablesPanel()
  } catch (e: any) {
    tableFormError.value = e.message
  }
}

async function changeTableStatus(id: number, status: string) {
  try {
    await tableService.updateStatus(id, status)
    await loadTablesPanel()
  } catch (e: any) {
    alert(e.message)
  }
}

async function removeTable(id: number) {
  if (!confirm('Delete this table?')) return
  try {
    await tableService.delete(id)
    await loadTablesPanel()
  } catch (e: any) {
    alert(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-primary.btn-sm { padding: 7px 14px; font-size: 13px; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-ghost.btn-sm { padding: 7px 14px; font-size: 13px; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.7; }
.btn-icon.danger:hover { opacity: 1; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-section-label { color: #aeb9e1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
.form-row { display: flex; gap: 12px; align-items: center; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; min-width: 0; }
.form-input:focus { border-color: #6c72ff; }
.form-select { flex: 2; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; cursor: pointer; min-width: 0; }
.form-select:focus { border-color: #6c72ff; }
.form-toggle { display: flex; align-items: center; gap: 8px; color: #aeb9e1; font-size: 14px; white-space: nowrap; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.badge-type { background: #37446b; color: #d1dbf9; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.status-active { color: #22c55e; font-size: 12px; font-weight: 600; }
.status-inactive { color: #ef4444; font-size: 12px; font-weight: 600; }

/* Menu Panel */
.menu-panel { background: #212c4d; border-radius: 12px; padding: 20px; margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.menu-panel-header { display: flex; align-items: center; justify-content: space-between; }
.menu-item-form { background: #1a2240; border-radius: 8px; padding: 14px; }
.menu-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.menu-table th { color: #aeb9e1; font-weight: 600; padding: 8px 12px; border-bottom: 1px solid #37446b; text-align: left; }
.menu-table td { padding: 10px 12px; border-bottom: 1px solid #2a3555; color: #d1dbf9; }
.price-cell { font-family: monospace; }
.actions-cell { white-space: nowrap; }
.avail-yes { color: #22c55e; font-size: 12px; font-weight: 600; }
.avail-no { color: #ef4444; font-size: 12px; font-weight: 600; }
.loading-text { color: #aeb9e1; font-size: 14px; }
.empty-text { color: #4a5580; font-size: 13px; text-align: center; padding: 20px; }
.status-select { background: #2a3a5e; border: 1px solid #4a5580; border-radius: 6px; padding: 4px 8px; color: #fff; font-size: 12px; cursor: pointer; outline: none; }
.status-select:focus { border-color: #6c72ff; }
.qr-cell { font-size: 12px; color: #7e89ac; font-family: monospace; }
</style>
