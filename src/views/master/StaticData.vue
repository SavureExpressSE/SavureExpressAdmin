<template>
  <div>
    <div class="section-header">
      <div class="section-title">Static Data</div>
      <button class="btn-primary" @click="openForm()">+ Add Static Data</button>
    </div>

    <!-- Add / Edit Form -->
    <div v-if="showForm" class="form-card">
      <div class="form-card-title">{{ form.id ? 'Edit Static Data' : 'Add Static Data' }}</div>
      <div class="form-row">
        <FloatingInput v-model="form.name" label="Name *" />
        <FloatingInput v-model="form.description" label="Description" />
      </div>

      <!-- Values section -->
      <div class="values-section">
        <div class="values-header">
          <span class="form-section-label">Values</span>
          <button class="btn-ghost btn-sm" @click="addValue">+ Add Value</button>
        </div>
        <div v-if="form.staticDataValues.length === 0" class="empty-values">
          No values added yet. Click "+ Add Value" to add one.
        </div>
        <div
          v-for="(val, idx) in form.staticDataValues"
          :key="idx"
          class="value-row"
        >
          <div class="seq-input">
            <FloatingInput
              :modelValue="String(val.sequence)"
              label="Seq *"
              type="number"
              min="1"
              @update:modelValue="v => val.sequence = v ? Number(v) : 1"
            />
          </div>
          <div class="val-input">
            <FloatingInput v-model="val.value" label="Value *" />
          </div>
          <button class="btn-icon danger" title="Remove" @click="removeValue(idx)">🗑️</button>
        </div>
      </div>

      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <div class="form-actions">
        <button class="btn-primary" @click="submit">{{ form.id ? 'Update' : 'Save' }}</button>
        <button class="btn-ghost" @click="closeForm">Cancel</button>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="loading-text">Loading…</div>
    <div v-else-if="items.length === 0 && !showForm" class="empty-text">
      No static data records yet. Click "+ Add Static Data" to create one.
    </div>

    <div v-for="item in items" :key="item.id" class="static-data-card">
      <div class="card-header">
        <div class="card-meta">
          <span class="card-name">{{ item.name }}</span>
          <span v-if="item.description" class="card-desc">{{ item.description }}</span>
        </div>
        <div class="card-actions">
          <button class="btn-icon" title="Edit" @click="openForm(item)">✏️</button>
          <button class="btn-icon danger" title="Delete" @click="remove(item.id!)">🗑️</button>
        </div>
      </div>

      <div v-if="item.staticDataValues && item.staticDataValues.length > 0" class="values-list">
        <span
          v-for="v in sortedValues(item.staticDataValues)"
          :key="v.id ?? v.sequence"
          class="value-badge"
        >
          <span class="seq-label">{{ v.sequence }}</span>
          {{ v.value }}
        </span>
      </div>
      <div v-else class="no-values">No values</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import FloatingInput from '@/components/FloatingInput.vue'
import { staticDataService, type StaticData, type StaticDataValue } from '@/services/static-data-service'

const { confirm } = useConfirm()

const items = ref<StaticData[]>([])
const loading = ref(false)
const showForm = ref(false)
const formError = ref<string | null>(null)

const blankForm = (): StaticData => ({
  id: undefined,
  name: '',
  description: '',
  staticDataValues: [],
})

const form = reactive<StaticData>(blankForm())

function openForm(item?: StaticData) {
  formError.value = null
  if (item) {
    form.id = item.id
    form.name = item.name
    form.description = item.description ?? ''
    form.staticDataValues = item.staticDataValues
      ? item.staticDataValues.map(v => ({ ...v }))
      : []
  } else {
    Object.assign(form, blankForm())
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  formError.value = null
}

function addValue() {
  const nextSeq = form.staticDataValues.length > 0
    ? Math.max(...form.staticDataValues.map(v => v.sequence)) + 1
    : 1
  form.staticDataValues.push({ sequence: nextSeq, value: '' })
}

function removeValue(idx: number) {
  form.staticDataValues.splice(idx, 1)
}

async function submit() {
  if (!form.name.trim()) {
    formError.value = 'Name is required'
    return
  }
  for (const v of form.staticDataValues) {
    if (!v.value.trim()) {
      formError.value = 'All values must have a non-empty value'
      return
    }
    if (!v.sequence || v.sequence < 1) {
      formError.value = 'All values must have a valid sequence number'
      return
    }
  }
  formError.value = null

  try {
    await staticDataService.save({
      id: form.id,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      staticDataValues: form.staticDataValues.map(v => ({
        id: v.id,
        sequence: v.sequence,
        value: v.value.trim(),
      })),
    })
    closeForm()
    await load()
  } catch (e: any) {
    formError.value = e.message
  }
}

async function remove(id: number) {
  if (!await confirm('Delete this static data record?')) return
  try {
    await staticDataService.delete(id)
    await load()
  } catch (e: any) {
    alert(e.message)
  }
}

async function load() {
  loading.value = true
  try {
    const res = await staticDataService.getAll()
    items.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

function sortedValues(values: StaticDataValue[]) {
  return [...values].sort((a, b) => a.sequence - b.sequence)
}

onMounted(load)
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }

.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-primary.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-ghost:hover { background: #37446b; }
.btn-ghost.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.7; }
.btn-icon.danger:hover { opacity: 1; }

.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px; }
.form-card-title { color: #fff; font-size: 15px; font-weight: 600; }
.form-row { display: flex; gap: 12px; align-items: flex-start; }
.form-section-label { color: #aeb9e1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; }

.values-section { display: flex; flex-direction: column; gap: 8px; }
.values-header { display: flex; align-items: center; justify-content: space-between; }
.empty-values { color: #4a5580; font-size: 13px; padding: 8px 0; }
.value-row { display: flex; align-items: flex-start; gap: 10px; }
.seq-input { width: 90px; flex-shrink: 0; }
.val-input { flex: 1; min-width: 0; }

/* Cards */
.static-data-card { background: #212c4d; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
.card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.card-meta { display: flex; flex-direction: column; gap: 4px; }
.card-name { color: #fff; font-size: 15px; font-weight: 600; }
.card-desc { color: #7e89ac; font-size: 12px; }
.card-actions { display: flex; gap: 4px; flex-shrink: 0; }

.values-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.value-badge { display: inline-flex; align-items: center; gap: 5px; background: #1a2240; border: 1px solid #37446b; border-radius: 20px; padding: 4px 12px; font-size: 13px; color: #d1dbf9; }
.seq-label { background: #37446b; color: #aeb9e1; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.no-values { color: #4a5580; font-size: 12px; margin-top: 8px; }

.loading-text { color: #aeb9e1; font-size: 14px; }
.empty-text { color: #4a5580; font-size: 13px; text-align: center; padding: 40px; }
</style>
