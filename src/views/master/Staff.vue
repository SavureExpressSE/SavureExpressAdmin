<template>
  <div>
    <div class="section-header">
      <div class="section-title">Staff Management</div>
      <button class="btn-primary" @click="showForm = !showForm">+ Add Staff</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <FloatingInput v-model="form.firstName" label="First name *" />
        <FloatingInput v-model="form.lastName" label="Last name *" />
      </div>
      <div class="form-row">
        <FloatingInput v-model="form.email" label="Email *" type="email" />
        <FloatingInput v-model="form.password" label="Password *" type="password" />
      </div>
      <FloatingSelect v-model="form.role" label="Role *">
        <option value="STAFF">Staff</option>
        <option value="OWNER">Owner</option>
        <option value="ADMIN">Admin</option>
      </FloatingSelect>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submitStaff">Save</button>
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
        <button v-if="filterRole" class="btn-clear-filter" @click="clearFilters">✕ Clear</button>
      </template>

      <template #cell-role="{ value }">
        <span :class="['role-badge', roleClass(value)]">{{ value }}</span>
      </template>

      <template #cell-firstName="{ row }">
        {{ row.firstName }} {{ row.lastName }}
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import FloatingSelect from '@/components/FloatingSelect.vue'
import { userService, type User } from '@/services/user-service'
import { api } from '@/utils/request'

const columns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'firstName', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'restaurantName', label: 'Restaurant' },
]

const staff = ref<User[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)
const form = reactive({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF' })

const search = ref('')
const filterRole = ref('')
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

async function submitStaff() {
  formError.value = null
  if (!form.firstName || !form.email || !form.password) {
    formError.value = 'First name, email and password are required'; return
  }
  try {
    await api.post('/auth/register', {
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, passwordHash: form.password, role: form.role,
    })
    Object.assign(form, { firstName: '', lastName: '', email: '', password: '', role: 'STAFF' })
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
function clearFilters() { filterRole.value = ''; page.value = 0; load() }

onMounted(load)
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.role-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
.role-admin { background: #4a235a; color: #d4aaee; }
.role-owner { background: #451a03; color: #fdb52a; }
.role-staff { background: #1e3a5f; color: #57c3ff; }
</style>
