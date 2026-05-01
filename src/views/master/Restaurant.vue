<template>
  <div>
    <div class="section-header">
      <div class="section-title">Restaurants / Outlets</div>
      <button class="btn-primary" @click="openForm()">+ Add Outlet</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="form-row">
        <input v-model="form.name" class="form-input" placeholder="Name *" />
        <input v-model="form.code" class="form-input" placeholder="Code * (e.g. REST001)" />
      </div>
      <div class="form-row">
        <input v-model="form.email" class="form-input" type="email" placeholder="Email *" />
        <input v-model="form.mobile" class="form-input" placeholder="Mobile * (+91XXXXXXXXXX)" />
      </div>
      <div class="form-section-label">Address</div>
      <div class="form-row">
        <input v-model="form.address.street" class="form-input" placeholder="Street" />
        <input v-model="form.address.city" class="form-input" placeholder="City" />
      </div>
      <div class="form-row">
        <input v-model="form.address.state" class="form-input" placeholder="State" />
        <input v-model="form.address.zipcode" class="form-input" placeholder="Zipcode" />
        <input v-model="form.address.country" class="form-input" placeholder="Country" />
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submit">{{ form.id ? 'Update' : 'Save' }}</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">Loading…</div>
    <div v-else-if="!restaurants.length" class="empty-state">No outlets added yet.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Code</th><th>Email</th><th>Mobile</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in restaurants" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.name }}</td>
            <td><span class="badge">{{ r.code }}</span></td>
            <td>{{ r.email }}</td>
            <td>{{ r.mobile }}</td>
            <td>
              <button class="btn-icon" @click="openForm(r)">✏️</button>
              <button class="btn-icon danger" @click="remove(r.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { restaurantService, type Restaurant } from '@/services/restaurant-service'

const restaurants = ref<Restaurant[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)

const blankForm = () => ({ id: undefined as number | undefined, name: '', code: '', email: '', mobile: '', address: { street: '', city: '', state: '', zipcode: '', country: '' } })
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
  if (!form.name || !form.code || !form.email || !form.mobile) { formError.value = 'Name, code, email and mobile are required'; return }
  formError.value = null
  try {
    await restaurantService.save({ id: form.id, name: form.name, code: form.code, email: form.email, mobile: form.mobile, address: form.address })
    showForm.value = false
    await load()
  } catch (e: any) {
    formError.value = e.message
  }
}

async function remove(id: number) {
  if (!confirm('Delete this outlet?')) return
  await restaurantService.delete(id)
  await load()
}

async function load() {
  loading.value = true
  try { restaurants.value = await restaurantService.getAll() }
  finally { loading.value = false }
}

onMounted(load)
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
.form-section-label { color: #aeb9e1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
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
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
</style>
