<template>
  <div>
    <div class="section-header">
      <div class="section-title">Staff Management</div>
      <button class="btn-primary" @click="showForm = !showForm">+ Add Staff</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <input v-model="form.firstName" class="form-input" placeholder="First name *" />
        <input v-model="form.lastName" class="form-input" placeholder="Last name *" />
      </div>
      <div class="form-row">
        <input v-model="form.email" class="form-input" type="email" placeholder="Email *" />
        <input v-model="form.password" class="form-input" type="password" placeholder="Password *" />
      </div>
      <select v-model="form.role" class="form-input">
        <option value="STAFF">Staff</option>
        <option value="OWNER">Owner</option>
        <option value="ADMIN">Admin</option>
      </select>
      <div class="form-actions">
        <button class="btn-primary" @click="submitStaff">Save</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>

    <div v-if="loading" class="empty-state">Loading…</div>
    <div v-else-if="!staff.length" class="empty-state">No staff registered yet.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in staff" :key="s.id">
            <td>{{ s.id }}</td>
            <td>{{ s.firstName }} {{ s.lastName }}</td>
            <td>{{ s.email }}</td>
            <td><span :class="['role-badge', roleClass(s.role)]">{{ s.role }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { staffService, type Staff } from '@/services/staff-service'
import { api } from '@/utils/request'

const staff = ref<Staff[]>([])
const loading = ref(false)
const showForm = ref(false)
const error = ref<string | null>(null)
const form = reactive({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF' })

function roleClass(role: string) {
  if (role === 'ADMIN') return 'role-admin'
  if (role === 'OWNER') return 'role-owner'
  return 'role-staff'
}

async function submitStaff() {
  error.value = null
  if (!form.firstName || !form.email || !form.password) { error.value = 'Please fill required fields'; return }
  try {
    await api.post('/auth/register', { firstName: form.firstName, lastName: form.lastName, email: form.email, passwordHash: form.password, role: form.role })
    Object.assign(form, { firstName: '', lastName: '', email: '', password: '', role: 'STAFF' })
    showForm.value = false
    await loadStaff()
  } catch (e: any) {
    error.value = e.message
  }
}

async function loadStaff() {
  loading.value = true
  try { staff.value = await staffService.getAll() }
  catch { staff.value = [] }
  finally { loading.value = false }
}

onMounted(loadStaff)
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
.table-wrap { background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.role-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
.role-admin { background: #4a235a; color: #d4aaee; }
.role-owner { background: #451a03; color: #fdb52a; }
.role-staff { background: #1e3a5f; color: #57c3ff; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
</style>
