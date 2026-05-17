<template>
  <div>
    <div class="section-header">
      <div class="section-title">Restaurants / Outlets</div>
      <button class="btn-primary" @click="openForm()">+ Add Outlet</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <FloatingInput v-model="form.name" label="Name *" />
        <div class="field-col">
          <FloatingInput
            :modelValue="form.code"
            label="Code * (e.g. REST001)"
            @update:modelValue="v => form.code = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '')"
            @keydown="onCodeKeydown"
            @paste="onCodePaste"
          />
          <span v-if="codeError" class="field-error">{{ codeError }}</span>
        </div>
      </div>
      <div class="form-row">
        <div class="field-col">
          <FloatingInput v-model="form.email" label="Email *" type="email" @blur="emailTouched = true" />
          <span v-if="emailTouched && emailError" class="field-error">{{ emailError }}</span>
        </div>
        <FloatingPhoneInput v-model="form.mobile" label="Mobile *" />
      </div>
      <div class="form-row">
        <FloatingSelect v-model="form.outletType" label="Outlet Type *">
          <option value="RESTAURANT">Restaurant</option>
          <option value="FOOD_TRUCK">Food Truck</option>
          <option value="BAR">Bar</option>
        </FloatingSelect>
        <FloatingSelect v-model="form.isActiveStr" label="Status">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </FloatingSelect>
      </div>
      <div class="form-section-label">Address</div>
      <div class="address-grid">
        <FloatingInput v-model="form.address.street" label="Street *" />
        <FloatingInput v-model="form.address.lane" label="Lane *" />
        <div class="zipcode-wrapper">
          <FloatingInput v-model="form.address.zipcode" label="Zipcode" @input="onZipcodeInput" @blur="hideDropdown" />
          <span v-if="zipcodeStatus === 'loading'" class="zip-hint zip-loading">Looking up…</span>
          <span v-else-if="zipcodeStatus === 'found'" class="zip-hint zip-found">✓ Auto-filled</span>
          <span v-else-if="zipcodeStatus === 'notfound'" class="zip-hint zip-notfound">Not in master data</span>
          <div v-if="showZipDropdown && zipcodeSuggestions.length" class="zip-dropdown">
            <div
              v-for="s in zipcodeSuggestions"
              :key="s.id"
              class="zip-dropdown-item"
              @mousedown.prevent="selectZipcode(s)"
            >
              <span class="zip-drop-code">{{ s.code }}</span>
              <span class="zip-drop-location">{{ s.city }}, {{ s.state }}, {{ s.country }}</span>
            </div>
          </div>
        </div>
        <FloatingSelect
          :modelValue="form.address.countryId ? String(form.address.countryId) : ''"
          label="Country"
          @update:modelValue="onCountryChange"
        >
          <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
        <FloatingSelect
          :modelValue="form.address.stateId ? String(form.address.stateId) : ''"
          label="State"
          :disabled="!form.address.countryId"
          @update:modelValue="onStateChange"
        >
          <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
        </FloatingSelect>
        <FloatingSelect
          :modelValue="form.address.cityId ? String(form.address.cityId) : ''"
          label="City"
          :disabled="!form.address.stateId"
          @update:modelValue="onCityChange"
        >
          <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
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
        <div class="filter-select-wrap">
          <FloatingSelect v-model="filterOutletType" label="Type" @update:modelValue="onFilter">
            <option value="RESTAURANT">Restaurant</option>
            <option value="FOOD_TRUCK">Food Truck</option>
            <option value="BAR">Bar</option>
          </FloatingSelect>
        </div>
        <div class="filter-select-wrap">
          <FloatingSelect v-model="filterIsActive" label="Status" @update:modelValue="onFilter">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </FloatingSelect>
        </div>
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
        <button class="btn-icon" @click="openForm(row as Restaurant)">✏️</button>
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
          <FloatingSelect
            :modelValue="menuItemForm.menuItemId !== '' ? String(menuItemForm.menuItemId) : ''"
            label="Menu Item *"
            :disabled="!!menuItemForm.id"
            @update:modelValue="v => menuItemForm.menuItemId = v ? Number(v) : ''"
          >
            <optgroup v-for="cat in categoriesWithItems" :key="cat.id" :label="cat.name">
              <option v-for="item in cat.items" :key="item.id" :value="item.id">
                {{ item.name }} (Base ₹{{ item.price }})
              </option>
            </optgroup>
          </FloatingSelect>
          <FloatingInput
            :modelValue="menuItemForm.price !== 0 ? String(menuItemForm.price) : ''"
            label="Price *"
            type="number"
            min="0.01"
            step="0.01"
            @update:modelValue="v => menuItemForm.price = v ? Number(v) : 0"
          />
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
          <FloatingInput v-model="newTableQr" label="QR Code (optional)" />
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
              <FloatingSelect
                :modelValue="t.status"
                label="Status"
                @update:modelValue="v => changeTableStatus(t.id, v)"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="RESERVED">RESERVED</option>
              </FloatingSelect>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import type { Zipcode, Country, State, City } from '@/services/location-service'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import FloatingSelect from '@/components/FloatingSelect.vue'
import FloatingPhoneInput from '@/components/FloatingPhoneInput.vue'
import { parseMobile } from '@/utils/phone-countries'
import { restaurantService, type Restaurant, type RestaurantPayload } from '@/services/restaurant-service'
import { menuService, type RestaurantMenuItem } from '@/services/menu-service'
import type { MenuItem } from '@/services/menu-service'
import { tableService, type DiningTable } from '@/services/table-service'
import { locationService } from '@/services/location-service'

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

const { confirm } = useConfirm()

const restaurants = ref<Restaurant[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)
const emailError = ref<string | null>(null)
const emailTouched = ref(false)
const codeError = ref<string | null>(null)

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
  outletType: 'RESTAURANT' as string,
  isActiveStr: 'true' as string,
  address: {
    street: '',
    lane: '',
    zipcode: '',
    zipcodeId: undefined as number | undefined,
    city: '',
    cityId: undefined as number | undefined,
    state: '',
    stateId: undefined as number | undefined,
    country: '',
    countryId: undefined as number | undefined,
  },
})
const form = reactive(blankForm())

watch(() => form.email, (val) => {
  if (!val) { emailError.value = null; return }
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Invalid email address'
})

let codeCheckTimer: ReturnType<typeof setTimeout>
watch(() => form.code, (val) => {
  clearTimeout(codeCheckTimer)
  if (!val) { codeError.value = null; return }
  codeCheckTimer = setTimeout(async () => {
    try {
      const res = await restaurantService.checkCode(val, form.id)
      codeError.value = res.data ? 'This code is already in use' : null
    } catch { codeError.value = null }
  }, 400)
})

// ── Cascade dropdown data ─────────────────────────────────────────────────────
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])

async function loadCountries() {
  countries.value = await locationService.getCountries()
}

async function loadStates(countryId: number) {
  const res = await locationService.filterStates({ countryId, size: 500 })
  states.value = res.data?.content ?? []
}

async function loadCities(stateId: number) {
  const res = await locationService.filterCities({ stateId, size: 500 })
  cities.value = res.data?.content ?? []
}

async function onCountryChange(val: string) {
  const id = val ? Number(val) : undefined
  form.address.countryId = id
  form.address.country = countries.value.find(c => c.id === id)?.name ?? ''
  form.address.stateId = undefined
  form.address.state = ''
  form.address.cityId = undefined
  form.address.city = ''
  states.value = []
  cities.value = []
  if (id) await loadStates(id)
}

async function onStateChange(val: string) {
  const id = val ? Number(val) : undefined
  form.address.stateId = id
  form.address.state = states.value.find(s => s.id === id)?.name ?? ''
  form.address.cityId = undefined
  form.address.city = ''
  cities.value = []
  if (id) await loadCities(id)
}

function onCityChange(val: string) {
  const id = val ? Number(val) : undefined
  form.address.cityId = id
  form.address.city = cities.value.find(c => c.id === id)?.name ?? ''
}

const zipcodeStatus = ref<'idle' | 'loading' | 'found' | 'notfound'>('idle')
const zipcodeSuggestions = ref<Zipcode[]>([])
const showZipDropdown = ref(false)
let zipcodeTimer: ReturnType<typeof setTimeout>

function onZipcodeInput() {
  clearTimeout(zipcodeTimer)
  form.address.zipcodeId = undefined
  zipcodeStatus.value = 'idle'
  zipcodeSuggestions.value = []
  showZipDropdown.value = false
  const code = form.address.zipcode.trim()
  if (!code) return
  zipcodeStatus.value = 'loading'
  zipcodeTimer = setTimeout(async () => {
    try {
      const res = await locationService.filterZipcodes({ code, size: 10 })
      const results = res.data?.content ?? []
      if (results.length > 0) {
        zipcodeSuggestions.value = results
        showZipDropdown.value = true
        zipcodeStatus.value = 'idle'
      } else {
        zipcodeStatus.value = 'notfound'
      }
    } catch {
      zipcodeStatus.value = 'idle'
    }
  }, 300)
}

async function selectZipcode(z: Zipcode) {
  form.address.zipcode = z.code
  form.address.zipcodeId = z.id
  form.address.country = z.country || ''
  form.address.countryId = z.countryId
  form.address.state = z.state || ''
  form.address.stateId = z.stateId
  form.address.city = z.city || ''
  form.address.cityId = z.cityId
  zipcodeSuggestions.value = []
  showZipDropdown.value = false
  zipcodeStatus.value = 'found'
  if (z.countryId) await loadStates(z.countryId)
  if (z.stateId) await loadCities(z.stateId)
}

function hideDropdown() {
  setTimeout(() => { showZipDropdown.value = false }, 150)
}

async function openForm(r?: Restaurant) {
  formError.value = null
  emailError.value = null
  emailTouched.value = false
  codeError.value = null
  zipcodeStatus.value = 'idle'
  zipcodeSuggestions.value = []
  showZipDropdown.value = false
  states.value = []
  cities.value = []

  if (r) {
    // Fetch full detail — list response may have incomplete address data
    const full = await restaurantService.getById(r.id).catch(() => r)
    const addr = full.address ?? {}

    // Assign top-level fields directly (avoids Object.assign nested-object pitfall)
    form.id          = full.id
    form.name        = full.name ?? ''
    form.code        = full.code ?? ''
    form.email       = full.email ?? ''
    form.mobile      = full.mobile ?? ''
    form.outletType  = full.outletType ?? 'RESTAURANT'
    form.isActiveStr = String(full.isActive ?? true)

    // Mutate the existing reactive form.address in place
    // API returns zipCode / zipCodeId (capital C) — map to internal names
    // Backend now also returns cityId / stateId / countryId from AddressResponse
    Object.assign(form.address, {
      street    : addr.street    ?? '',
      lane      : addr.lane      ?? '',
      zipcode   : addr.zipCode   ?? '',
      zipcodeId : addr.zipCodeId ?? undefined,
      city      : addr.city      ?? '',
      cityId    : addr.cityId    ?? undefined,
      state     : addr.state     ?? '',
      stateId   : addr.stateId   ?? undefined,
      country   : addr.country   ?? '',
      countryId : addr.countryId ?? undefined,
    })

    if (addr.zipCodeId) zipcodeStatus.value = 'found'

    // Load cascade lists using IDs returned directly by the backend
    if (form.address.countryId) {
      await loadStates(form.address.countryId)
    }
    if (form.address.stateId) {
      await loadCities(form.address.stateId)
    }

    // Fallback: if backend didn't return IDs, match by name
    if (!form.address.countryId && addr.country) {
      const country = countries.value.find(c => c.name === addr.country)
      if (country) {
        form.address.countryId = country.id
        await loadStates(country.id)
        if (!form.address.stateId && addr.state) {
          const state = states.value.find(s => s.name === addr.state)
          if (state) {
            form.address.stateId = state.id
            await loadCities(state.id)
            if (!form.address.cityId && addr.city) {
              const city = cities.value.find(c => c.name === addr.city)
              if (city) form.address.cityId = city.id
            }
          }
        }
      }
    }
  } else {
    const blank = blankForm()
    form.id          = blank.id
    form.name        = blank.name
    form.code        = blank.code
    form.email       = blank.email
    form.mobile      = blank.mobile
    form.outletType  = blank.outletType
    form.isActiveStr = blank.isActiveStr
    Object.assign(form.address, blank.address)
  }
  showForm.value = true
}

async function submit() {
  if (!form.name || !form.code || !form.email || !form.mobile) {
    formError.value = 'Name, code, email and mobile are required'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    formError.value = 'Please enter a valid email address'
    return
  }
  const { country: mobileCountry, number: mobileNumber } = parseMobile(form.mobile.trim())
  if (mobileCountry) {
    const [min, max] = mobileCountry.len
    if (mobileNumber.length < min || mobileNumber.length > max) {
      formError.value = `Mobile number must be ${min === max ? min : `${min}–${max}`} digits for ${mobileCountry.name}`
      return
    }
  } else if (form.mobile.replace(/\D/g, '').length < 7) {
    formError.value = 'Please enter a valid mobile number'
    return
  }
  if (!form.address.street.trim() || !form.address.lane.trim()) {
    formError.value = 'Street and Lane are required'
    return
  }
  if (!form.address.cityId && !form.address.zipcodeId) {
    formError.value = 'Please select Country → State → City, or enter a valid Zipcode'
    return
  }
  formError.value = null

  // Auto-create zipcode if user typed a code not yet in master
  if (form.address.zipcode.trim() && !form.address.zipcodeId && form.address.cityId) {
    try {
      const created = await locationService.saveZipcode({
        code: form.address.zipcode.trim(),
        cityId: form.address.cityId,
      })
      form.address.zipcodeId = created.id
    } catch {
      // Code may already exist — find and reuse it
      const existing = await locationService.filterZipcodes({ code: form.address.zipcode.trim(), size: 1 }).catch(() => null)
      const match = existing?.data?.content?.[0]
      if (match) {
        form.address.zipcodeId = match.id
      } else {
        formError.value = 'Could not create or find the specified zipcode'
        return
      }
    }
  }

  const payload: RestaurantPayload = {
    ...(form.id !== undefined ? { id: form.id } : {}),
    name: form.name.trim(),
    code: form.code.trim(),
    email: form.email.trim(),
    mobile: form.mobile.trim(),
    outletType: form.outletType,
    isActive: form.isActiveStr === 'true',
    address: {
      street: form.address.street.trim(),
      lane: form.address.lane.trim(),
      ...(form.address.zipcodeId ? { zipcodeId: form.address.zipcodeId } : { cityId: form.address.cityId }),
    },
  }

  try {
    await restaurantService.save(payload)
    showForm.value = false
    page.value = 0
    await load()
  } catch (e: any) {
    formError.value = e.message
  }
}

async function remove(id: number) {
  if (!await confirm('Delete this outlet?')) return
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

function onCodeKeydown(e: KeyboardEvent) {
  if (e.key.length === 1 && !/^[a-zA-Z0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey)
    e.preventDefault()
}
function onCodePaste(e: ClipboardEvent) {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') ?? ''
  form.code = (form.code + pasted).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

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
  if (!await confirm('Remove this item from the restaurant menu?')) return
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
  if (!await confirm('Delete this table?')) return
  try {
    await tableService.delete(id)
    await loadTablesPanel()
  } catch (e: any) {
    alert(e.message)
  }
}

onMounted(async () => {
  await loadCountries()
  await load()
})
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
.form-row { display: flex; gap: 12px; align-items: flex-start; }
.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-items: start; }
.address-full { grid-column: 1 / -1; }
.zipcode-wrapper { display: flex; flex-direction: column; gap: 4px; position: relative; }
.zip-hint { font-size: 11px; padding-left: 2px; }
.zip-loading { color: #aeb9e1; }
.zip-found { color: #22c55e; }
.zip-notfound { color: #f59e0b; }
.zip-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #1a2240; border: 1px solid #4a5580; border-radius: 8px; z-index: 50; max-height: 200px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.zip-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 9px 14px; cursor: pointer; transition: background 0.15s; }
.zip-dropdown-item:hover { background: #2a3a5e; }
.zip-dropdown-item:not(:last-child) { border-bottom: 1px solid #2a3555; }
.zip-drop-code { color: #57c3ff; font-size: 13px; font-weight: 600; white-space: nowrap; }
.zip-drop-location { color: #aeb9e1; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.form-toggle { display: flex; align-items: center; gap: 8px; color: #aeb9e1; font-size: 14px; white-space: nowrap; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }
.field-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.field-error { color: #ef4444; font-size: 12px; padding-left: 14px; }
.filter-select-wrap { width: 150px; flex-shrink: 0; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; align-self: center; }
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
.qr-cell { font-size: 12px; color: #7e89ac; font-family: monospace; }
</style>
