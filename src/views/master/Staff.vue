<template>
  <div>
    <div class="section-header">
      <div class="section-title">Staff Management</div>
      <button class="btn-primary" @click="openAddForm">+ Add Staff</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-card-title">{{ form.id ? 'Edit Staff' : 'Add Staff' }}</div>
      <div class="form-row">
        <FloatingInput v-model="form.firstName" label="First name *" />
        <FloatingInput v-model="form.lastName" label="Last name *" />
      </div>
      <div class="form-row">
        <FloatingInput v-model="form.email" label="Email *" />
        <FloatingPhoneInput v-model="form.mobile" label="Mobile *" />
      </div>
      <div class="form-row">
        <FloatingInput v-model="form.password" :label="form.id ? 'New password (leave blank to keep)' : 'Password *'" type="password" />
        <FloatingSelect v-model="form.role" label="Role *">
          <option value="STAFF">Staff</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
        </FloatingSelect>
      </div>
      <div class="form-row">
        <FloatingSelect v-model="form.restaurantId" label="Restaurant (optional)">
          <option :value="undefined">— None —</option>
          <option v-for="r in allRestaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
        </FloatingSelect>
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submitStaff">{{ form.id ? 'Update' : 'Save' }}</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <DataTable
      v-model:search="search"
      v-model:currentPage="page"
      v-model:pageSize="pageSize"
      :columns="columns"
      :rows="staff"
      :loading="loading"
      :totalPages="totalPages"
      :totalElements="totalElements"
      search-placeholder="Search by email…"
      :sortBy="sortBy"
      :sortDir="sortDir"
      @update:search="onSearch"
      @update:currentPage="load"
      @update:pageSize="onPageSizeChange"
      @sort="({ sortBy: sb, sortDir: sd }) => { sortBy = sb; sortDir = sd; page = 0; load() }"
    >
      <template #filters>
        <select v-model="filterRole" class="filter-select" @change="onFilter">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Owner</option>
          <option value="STAFF">Staff</option>
        </select>
        <select v-model="filterRestaurantId" class="filter-select" @change="onFilter">
          <option value="">All Restaurants</option>
          <option v-for="r in allRestaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select v-model="filterActive" class="filter-select" @change="onFilter">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button v-if="filterRole || filterRestaurantId !== '' || filterActive !== ''" class="btn-clear-filter" @click="clearFilters">✕ Clear</button>
      </template>

      <template #cell-role="{ value }">
        <span :class="['role-badge', roleClass(value)]">{{ value }}</span>
      </template>

      <template #cell-firstName="{ row }">
        {{ row.firstName }} {{ row.lastName }}
      </template>

      <template #cell-active="{ row }">
        <button
          class="toggle-btn"
          :class="row.active ? 'toggle-on' : 'toggle-off'"
          @click="toggleActive(row)"
        >
          <span class="toggle-knob" />
        </button>
      </template>

      <template #rowActions="{ row }">
        <button class="btn-icon" @click="editStaff(row)">✏️</button>
        <button class="btn-icon danger" @click="deleteStaff(row.id)">🗑️</button>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import FloatingSelect from '@/components/FloatingSelect.vue'
import FloatingPhoneInput from '@/components/FloatingPhoneInput.vue'
import { useConfirm } from '@/composables/useConfirm'
import { userService, type User } from '@/services/user-service'
import { restaurantService, type Restaurant } from '@/services/restaurant-service'
import { api } from '@/utils/request'

const { confirm } = useConfirm()

const columns = [
  { key: 'id',             label: '#',          sortable: true  },
  { key: 'firstName',      label: 'Name',        sortable: true  },
  { key: 'email',          label: 'Email',       sortable: true  },
  { key: 'mobile',         label: 'Mobile',      sortable: false },
  { key: 'role',           label: 'Role',        sortable: false },
  { key: 'restaurantName', label: 'Restaurant',  sortable: false },
  { key: 'active',         label: 'Status',      sortable: false },
]

const staff = ref<User[]>([])
const allRestaurants = ref<Restaurant[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)
const form = reactive({ id: undefined as number | undefined, firstName: '', lastName: '', email: '', mobile: '', password: '', role: 'STAFF', restaurantId: undefined as number | undefined })

const search = ref('')
const filterRole = ref('')
const filterRestaurantId = ref<number | ''>('')
const filterActive = ref<'true' | 'false' | ''>('')
const sortBy = ref('firstName')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)

function roleClass(role: string) {
  if (role === 'ADMIN') return 'role-admin'
  if (role === 'OWNER') return 'role-owner'
  return 'role-staff'
}

function openAddForm() {
  Object.assign(form, { id: undefined, firstName: '', lastName: '', email: '', mobile: '', password: '', role: 'STAFF', restaurantId: undefined })
  showForm.value = true
}

function editStaff(row: User) {
  Object.assign(form, {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    mobile: row.mobile ?? '',
    password: '',
    role: row.role,
    restaurantId: row.restaurantId ?? undefined,
  })
  showForm.value = true
}

async function submitStaff() {
  formError.value = null
  if (!form.firstName || !form.email || !form.mobile) {
    formError.value = 'First name, email and mobile are required'; return
  }
  if (!form.id && !form.password) {
    formError.value = 'Password is required for new staff'; return
  }
  try {
    if (form.id) {
      await userService.updateUser(form.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        password: form.password || undefined,
        role: form.role,
        restaurantId: form.restaurantId,
      })
    } else {
      await api.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: form.role,
        restaurantId: form.restaurantId,
      })
    }
    Object.assign(form, { id: undefined, firstName: '', lastName: '', email: '', mobile: '', password: '', role: 'STAFF', restaurantId: undefined })
    showForm.value = false
    page.value = 0
    await load()
  } catch (e: any) {
    formError.value = e.message
  }
}

async function load() {
  loading.value = true
  try {
    const res = await userService.filter({
      page: page.value, size: pageSize.value,
      sortBy: sortBy.value, sortDir: sortDir.value,
      email: search.value || undefined,
      role: filterRole.value || undefined,
      restaurantId: filterRestaurantId.value !== '' ? filterRestaurantId.value : undefined,
      active: filterActive.value !== '' ? filterActive.value === 'true' : undefined,
    })
    staff.value = res.data.content
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
function clearFilters() { filterRole.value = ''; filterRestaurantId.value = ''; filterActive.value = ''; page.value = 0; load() }

async function toggleActive(row: User) {
  try {
    const res = await userService.toggleActive(row.id)
    row.active = res.data.active
  } catch (e: any) {
    alert(e.message)
  }
}

async function deleteStaff(id: number) {
  if (!await confirm('Delete this staff member?')) return
  try {
    await userService.deleteUser(id)
    await load()
  } catch (e: any) {
    alert(e.message)
  }
}

onMounted(async () => {
  const res = await restaurantService.getAll()
  allRestaurants.value = Array.isArray(res) ? res : (res as any).data ?? []
  await load()
})
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-card-title { color: #d1dbf9; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.btn-icon { background: transparent; border: none; font-size: 15px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.6; }
.btn-icon.danger:hover { opacity: 1; }
.role-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
.role-admin { background: #4a235a; color: #d4aaee; }
.role-owner { background: #451a03; color: #fdb52a; }
.role-staff { background: #1e3a5f; color: #57c3ff; }
.toggle-btn { position: relative; width: 38px; height: 20px; border-radius: 20px; border: none; cursor: pointer; transition: background 0.2s; padding: 0; flex-shrink: 0; }
.toggle-on  { background: #22c55e; }
.toggle-off { background: #4a5580; }
.toggle-knob { position: absolute; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: left 0.2s; }
.toggle-on  .toggle-knob { left: 21px; }
.toggle-off .toggle-knob { left: 3px; }
</style>
