<template>
  <div>
    <div class="section-title">Location Master Data</div>

    <!-- Tabs -->
    <div class="tabs">
      <button v-for="t in tabs" :key="t" :class="['tab', activeTab === t && 'tab--active']" @click="activeTab = t">{{ t }}</button>
    </div>

    <!-- ───── COUNTRY ───── -->
    <div v-if="activeTab === 'Country'">
      <div class="sub-header">
        <span class="sub-title">Countries</span>
        <button class="btn-primary" @click="toggleForm('country')">+ Add</button>
      </div>
      <div v-if="forms.country" class="form-card">
        <div class="form-row">
          <input v-model="countryForm.name" class="form-input" placeholder="Country name *" />
          <input v-model="countryForm.code" class="form-input" placeholder="Code * (e.g. IN)" style="max-width:140px" />
        </div>
        <div class="form-actions">
          <button class="btn-primary" @click="saveCountry">Save</button>
          <button class="btn-ghost" @click="forms.country = false">Cancel</button>
        </div>
      </div>
      <div v-if="loading.country" class="empty-state">Loading…</div>
      <div v-else-if="!countries.length" class="empty-state">No countries added yet.</div>
      <table v-else class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>Code</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in countries" :key="c.id">
            <td>{{ c.id }}</td><td>{{ c.name }}</td><td><span class="badge">{{ c.code }}</span></td>
            <td><button class="btn-icon danger" @click="deleteCountry(c.id)">🗑️</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ───── STATE ───── -->
    <div v-if="activeTab === 'State'">
      <div class="sub-header">
        <span class="sub-title">States</span>
        <button class="btn-primary" @click="toggleForm('state')">+ Add</button>
      </div>
      <div v-if="forms.state" class="form-card">
        <div class="form-row">
          <input v-model="stateForm.name" class="form-input" placeholder="State name *" />
          <input v-model="stateForm.code" class="form-input" placeholder="Code *" style="max-width:140px" />
        </div>
        <select v-model.number="stateForm.countryId" class="form-input">
          <option value="" disabled>Select Country *</option>
          <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div class="form-actions">
          <button class="btn-primary" @click="saveState">Save</button>
          <button class="btn-ghost" @click="forms.state = false">Cancel</button>
        </div>
      </div>
      <div v-if="loading.state" class="empty-state">Loading…</div>
      <div v-else-if="!states.length" class="empty-state">No states added yet.</div>
      <table v-else class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>Code</th><th>Country</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in states" :key="s.id">
            <td>{{ s.id }}</td><td>{{ s.name }}</td><td><span class="badge">{{ s.code }}</span></td>
            <td>{{ s.countryName }}</td>
            <td><button class="btn-icon danger" @click="deleteState(s.id)">🗑️</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ───── CITY ───── -->
    <div v-if="activeTab === 'City'">
      <div class="sub-header">
        <span class="sub-title">Cities</span>
        <button class="btn-primary" @click="toggleForm('city')">+ Add</button>
      </div>
      <div v-if="forms.city" class="form-card">
        <div class="form-row">
          <input v-model="cityForm.name" class="form-input" placeholder="City name *" />
          <select v-model.number="cityForm.countryId" class="form-input" @change="cityForm.stateId = ''">
            <option value="" disabled>Country *</option>
            <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <select v-model.number="cityForm.stateId" class="form-input">
          <option value="" disabled>Select State *</option>
          <option v-for="s in statesForCity" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <div class="form-actions">
          <button class="btn-primary" @click="saveCity">Save</button>
          <button class="btn-ghost" @click="forms.city = false">Cancel</button>
        </div>
      </div>
      <div v-if="loading.city" class="empty-state">Loading…</div>
      <div v-else-if="!cities.length" class="empty-state">No cities added yet.</div>
      <table v-else class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>State</th><th>Country</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in cities" :key="c.id">
            <td>{{ c.id }}</td><td>{{ c.name }}</td><td>{{ c.stateName }}</td><td>{{ c.countryName }}</td>
            <td><button class="btn-icon danger" @click="deleteCity(c.id)">🗑️</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ───── ZIPCODE ───── -->
    <div v-if="activeTab === 'Zipcode'">
      <div class="sub-header">
        <span class="sub-title">Zipcodes</span>
        <button class="btn-primary" @click="toggleForm('zipcode')">+ Add</button>
      </div>
      <div v-if="forms.zipcode" class="form-card">
        <div class="form-row">
          <input v-model="zipcodeForm.code" class="form-input" placeholder="Zipcode *" />
          <select v-model.number="zipcodeForm.stateId" class="form-input" @change="zipcodeForm.cityId = ''">
            <option value="" disabled>State *</option>
            <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <select v-model.number="zipcodeForm.cityId" class="form-input">
          <option value="" disabled>Select City *</option>
          <option v-for="c in citiesForZipcode" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div class="form-actions">
          <button class="btn-primary" @click="saveZipcode">Save</button>
          <button class="btn-ghost" @click="forms.zipcode = false">Cancel</button>
        </div>
      </div>
      <div v-if="loading.zipcode" class="empty-state">Loading…</div>
      <div v-else-if="!zipcodes.length" class="empty-state">No zipcodes added yet.</div>
      <table v-else class="data-table">
        <thead><tr><th>#</th><th>Code</th><th>City</th><th>State</th><th>Country</th><th></th></tr></thead>
        <tbody>
          <tr v-for="z in zipcodes" :key="z.id">
            <td>{{ z.id }}</td><td><span class="badge">{{ z.code }}</span></td>
            <td>{{ z.city }}</td><td>{{ z.state }}</td><td>{{ z.country }}</td>
            <td><button class="btn-icon danger" @click="deleteZipcode(z.id)">🗑️</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { locationService, type Country, type State, type City, type Zipcode } from '@/services/location-service'

const tabs = ['Country', 'State', 'City', 'Zipcode'] as const
type Tab = typeof tabs[number]
const activeTab = ref<Tab>('Country')

const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])
const zipcodes = ref<Zipcode[]>([])

const loading = reactive({ country: false, state: false, city: false, zipcode: false })
const forms = reactive({ country: false, state: false, city: false, zipcode: false })

const countryForm = reactive({ name: '', code: '' })
const stateForm = reactive({ name: '', code: '', countryId: '' as any })
const cityForm = reactive({ name: '', countryId: '' as any, stateId: '' as any })
const zipcodeForm = reactive({ code: '', stateId: '' as any, cityId: '' as any })

const statesForCity = computed(() => cityForm.countryId ? states.value.filter(s => s.countryId === cityForm.countryId) : states.value)
const citiesForZipcode = computed(() => zipcodeForm.stateId ? cities.value.filter(c => {
  const s = states.value.find(s => s.id === zipcodeForm.stateId)
  return s ? c.stateName === s.name : true
}) : cities.value)

function toggleForm(tab: keyof typeof forms) {
  forms[tab] = !forms[tab]
}

// Country
async function loadCountries() {
  loading.country = true
  try { countries.value = await locationService.getCountries() } finally { loading.country = false }
}
async function saveCountry() {
  if (!countryForm.name || !countryForm.code) return
  await locationService.saveCountry({ name: countryForm.name, code: countryForm.code })
  Object.assign(countryForm, { name: '', code: '' }); forms.country = false
  await loadCountries()
}
async function deleteCountry(id: number) {
  if (!confirm('Delete country?')) return
  await locationService.deleteCountry(id); await loadCountries()
}

// State
async function loadStates() {
  loading.state = true
  try { states.value = await locationService.getStates() } finally { loading.state = false }
}
async function saveState() {
  if (!stateForm.name || !stateForm.code || !stateForm.countryId) return
  await locationService.saveState({ name: stateForm.name, code: stateForm.code, countryId: stateForm.countryId })
  Object.assign(stateForm, { name: '', code: '', countryId: '' }); forms.state = false
  await loadStates()
}
async function deleteState(id: number) {
  if (!confirm('Delete state?')) return
  await locationService.deleteState(id); await loadStates()
}

// City
async function loadCities() {
  loading.city = true
  try { cities.value = await locationService.getCities() } finally { loading.city = false }
}
async function saveCity() {
  if (!cityForm.name || !cityForm.stateId) return
  await locationService.saveCity({ name: cityForm.name, stateId: cityForm.stateId })
  Object.assign(cityForm, { name: '', countryId: '', stateId: '' }); forms.city = false
  await loadCities()
}
async function deleteCity(id: number) {
  if (!confirm('Delete city?')) return
  await locationService.deleteCity(id); await loadCities()
}

// Zipcode
async function loadZipcodes() {
  loading.zipcode = true
  try { zipcodes.value = await locationService.getZipcodes() } finally { loading.zipcode = false }
}
async function saveZipcode() {
  if (!zipcodeForm.code || !zipcodeForm.cityId) return
  await locationService.saveZipcode({ code: zipcodeForm.code, cityId: zipcodeForm.cityId })
  Object.assign(zipcodeForm, { code: '', stateId: '', cityId: '' }); forms.zipcode = false
  await loadZipcodes()
}
async function deleteZipcode(id: number) {
  if (!confirm('Delete zipcode?')) return
  await locationService.deleteZipcode(id); await loadZipcodes()
}

// Load data when tab becomes active
watch(activeTab, (tab) => {
  if (tab === 'Country' && !countries.value.length) loadCountries()
  if (tab === 'State') { if (!countries.value.length) loadCountries(); loadStates() }
  if (tab === 'City') { if (!countries.value.length) loadCountries(); if (!states.value.length) loadStates(); loadCities() }
  if (tab === 'Zipcode') { if (!states.value.length) loadStates(); if (!cities.value.length) loadCities(); loadZipcodes() }
})

onMounted(loadCountries)
</script>

<style scoped>
.section-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.tabs { display: flex; gap: 4px; background: #212c4d; border-radius: 10px; padding: 4px; margin-bottom: 24px; width: fit-content; }
.tab { padding: 8px 20px; border: none; border-radius: 8px; background: transparent; color: #aeb9e1; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.tab:hover { color: #fff; }
.tab--active { background: #6c72ff; color: #fff; }
.sub-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.sub-title { color: #d1dbf9; font-size: 14px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: #4a4fcc; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-icon { background: transparent; border: none; font-size: 15px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.6; }
.btn-icon.danger:hover { opacity: 1; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-actions { display: flex; gap: 12px; }
.data-table { width: 100%; border-collapse: collapse; background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
</style>
