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
          <div class="field-wrap">
            <FloatingInput v-model="countryForm.name" label="Country name *" />
            <span v-if="countryNameError" class="field-error">{{ countryNameError }}</span>
          </div>
          <div class="field-wrap" style="max-width:130px">
            <FloatingInput v-model="countryForm.code" label="Code * (e.g. IN)" />
            <span v-if="countryCodeError" class="field-error">{{ countryCodeError }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="field-wrap" style="max-width:140px">
            <FloatingInput v-model="countryForm.dial" label="Dial code (e.g. +91)" />
          </div>
          <div class="field-wrap" style="max-width:110px">
            <FloatingInput v-model="countryForm.flag" label="Flag emoji" />
          </div>
          <div class="field-wrap" style="max-width:130px">
            <FloatingInput v-model="countryForm.phoneLenMin" label="Phone min digits" />
          </div>
          <div class="field-wrap" style="max-width:130px">
            <FloatingInput v-model="countryForm.phoneLenMax" label="Phone max digits" />
          </div>
        </div>
        <p v-if="countryFormError" class="error-msg">{{ countryFormError }}</p>
        <div class="form-actions">
          <button class="btn-primary" :disabled="!!countryNameError || !!countryCodeError" @click="saveCountry">{{ countryForm.id ? 'Update' : 'Save' }}</button>
          <button class="btn-ghost" @click="forms.country = false">Cancel</button>
        </div>
      </div>
      <DataTable
        v-model:search="country.search"
        v-model:currentPage="country.page"
        v-model:pageSize="country.pageSize"
        :columns="countryColumns"
        :rows="country.rows"
        :loading="country.loading"
        :totalPages="country.totalPages"
        :totalElements="country.totalElements"
        search-placeholder="Search by name or code…"
        :sortBy="country.sortBy"
        :sortDir="country.sortDir"
        @update:search="onCountrySearch"
        @update:currentPage="loadCountries"
        @update:pageSize="() => { country.page = 0; loadCountries() }"
        @sort="({ sortBy: sb, sortDir: sd }) => { country.sortBy = sb; country.sortDir = sd; country.page = 0; loadCountries() }"
      >
        <template #cell-flag="{ value }"><span class="country-flag">{{ value }}</span></template>
        <template #cell-code="{ value }"><span class="badge">{{ value }}</span></template>
        <template #cell-dial="{ value }"><span class="badge badge--dial">{{ value }}</span></template>
        <template #cell-phoneLen="{ value }"><span class="badge badge--len">{{ value }}</span></template>
        <template #rowActions="{ row }">
          <button class="btn-icon" @click="editCountry(row)">✏️</button>
          <button class="btn-icon danger" @click="deleteCountry(row.id)">🗑️</button>
        </template>
      </DataTable>
    </div>

    <!-- ───── STATE ───── -->
    <div v-if="activeTab === 'State'">
      <div class="sub-header">
        <span class="sub-title">States</span>
        <button class="btn-primary" @click="toggleForm('state')">+ Add</button>
      </div>
      <div v-if="forms.state" class="form-card">
        <FloatingSelect v-model.number="stateForm.countryId" label="Country *" @change="() => { stateForm.name = ''; stateForm.code = ''; stateNameError = null; stateCodeError = null }">
          <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
        <template v-if="stateForm.countryId">
          <div class="form-row">
            <div class="field-wrap">
              <FloatingInput v-model="stateForm.name" label="State name *" />
              <span v-if="stateNameError" class="field-error">{{ stateNameError }}</span>
            </div>
            <div class="field-wrap" style="max-width:140px">
              <FloatingInput v-model="stateForm.code" label="Code *" />
              <span v-if="stateCodeError" class="field-error">{{ stateCodeError }}</span>
            </div>
          </div>
        </template>
        <p v-if="stateFormError" class="error-msg">{{ stateFormError }}</p>
        <div class="form-actions">
          <button class="btn-primary" :disabled="!!stateNameError || !!stateCodeError" @click="saveState">{{ stateForm.id ? 'Update' : 'Save' }}</button>
          <button class="btn-ghost" @click="forms.state = false">Cancel</button>
        </div>
      </div>
      <DataTable
        v-model:search="state.search"
        v-model:currentPage="state.page"
        v-model:pageSize="state.pageSize"
        :columns="stateColumns"
        :rows="state.rows"
        :loading="state.loading"
        :totalPages="state.totalPages"
        :totalElements="state.totalElements"
        search-placeholder="Search by name or code…"
        :sortBy="state.sortBy"
        :sortDir="state.sortDir"
        @update:search="onStateSearch"
        @update:currentPage="loadStates"
        @update:pageSize="() => { state.page = 0; loadStates() }"
        @sort="({ sortBy: sb, sortDir: sd }) => { state.sortBy = sb; state.sortDir = sd; state.page = 0; loadStates() }"
      >
        <template #filters>
          <select v-model="state.filterCountryId" class="filter-select" @change="() => { state.page = 0; loadStates() }">
            <option value="">All Countries</option>
            <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <button v-if="state.filterCountryId" class="btn-clear-filter" @click="() => { state.filterCountryId = ''; state.page = 0; loadStates() }">✕ Clear</button>
        </template>
        <template #cell-code="{ value }"><span class="badge">{{ value }}</span></template>
        <template #rowActions="{ row }">
          <button class="btn-icon" @click="editState(row)">✏️</button>
          <button class="btn-icon danger" @click="deleteState(row.id)">🗑️</button>
        </template>
      </DataTable>
    </div>

    <!-- ───── CITY ───── -->
    <div v-if="activeTab === 'City'">
      <div class="sub-header">
        <span class="sub-title">Cities</span>
        <button class="btn-primary" @click="toggleForm('city')">+ Add</button>
      </div>
      <div v-if="forms.city" class="form-card">
        <FloatingSelect v-model.number="cityForm.countryId" label="Country *" @change="() => { cityForm.stateId = ''; cityForm.name = ''; cityNameError = null }">
          <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
        <FloatingSelect v-if="cityForm.countryId" v-model.number="cityForm.stateId" label="State *" @change="() => { cityForm.name = ''; cityNameError = null }">
          <option v-for="s in statesForCity" :key="s.id" :value="s.id">{{ s.name }}</option>
        </FloatingSelect>
        <template v-if="cityForm.stateId">
          <div class="field-wrap" style="width: 100%">
            <FloatingInput v-model="cityForm.name" label="City name *" />
            <span v-if="cityNameError" class="field-error">{{ cityNameError }}</span>
          </div>
        </template>
        <p v-if="cityFormError" class="error-msg">{{ cityFormError }}</p>
        <div class="form-actions">
          <button class="btn-primary" :disabled="!!cityNameError" @click="saveCity">{{ cityForm.id ? 'Update' : 'Save' }}</button>
          <button class="btn-ghost" @click="forms.city = false">Cancel</button>
        </div>
      </div>
      <DataTable
        v-model:search="city.search"
        v-model:currentPage="city.page"
        v-model:pageSize="city.pageSize"
        :columns="cityColumns"
        :rows="city.rows"
        :loading="city.loading"
        :totalPages="city.totalPages"
        :totalElements="city.totalElements"
        search-placeholder="Search by city name…"
        :sortBy="city.sortBy"
        :sortDir="city.sortDir"
        @update:search="onCitySearch"
        @update:currentPage="loadCities"
        @update:pageSize="() => { city.page = 0; loadCities() }"
        @sort="({ sortBy: sb, sortDir: sd }) => { city.sortBy = sb; city.sortDir = sd; city.page = 0; loadCities() }"
      >
        <template #filters>
          <select v-model="city.filterCountryId" class="filter-select" @change="onCityCountryFilter">
            <option value="">All Countries</option>
            <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <select v-model="city.filterStateId" class="filter-select" @change="() => { city.page = 0; loadCities() }">
            <option value="">All States</option>
            <option v-for="s in statesForCityFilter" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <button v-if="city.filterCountryId || city.filterStateId" class="btn-clear-filter" @click="() => { city.filterCountryId = ''; city.filterStateId = ''; city.page = 0; loadCities() }">✕ Clear</button>
        </template>
        <template #rowActions="{ row }">
          <button class="btn-icon" @click="editCity(row)">✏️</button>
          <button class="btn-icon danger" @click="deleteCity(row.id)">🗑️</button>
        </template>
      </DataTable>
    </div>

    <!-- ───── ZIPCODE ───── -->
    <div v-if="activeTab === 'Zipcode'">
      <div class="sub-header">
        <span class="sub-title">Zipcodes</span>
        <button class="btn-primary" @click="toggleForm('zipcode')">+ Add</button>
      </div>
      <div v-if="forms.zipcode" class="form-card">
        <FloatingSelect v-model.number="zipcodeForm.countryId" label="Country *" @change="() => { zipcodeForm.stateId = ''; zipcodeForm.cityId = ''; zipcodeForm.code = ''; zipcodeCodeError = null }">
          <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
        <FloatingSelect v-if="zipcodeForm.countryId" v-model.number="zipcodeForm.stateId" label="State *" @change="() => { zipcodeForm.cityId = ''; zipcodeForm.code = ''; zipcodeCodeError = null }">
          <option v-for="s in statesForZipcode" :key="s.id" :value="s.id">{{ s.name }}</option>
        </FloatingSelect>
        <FloatingSelect v-if="zipcodeForm.stateId" v-model.number="zipcodeForm.cityId" label="City *" @change="() => { zipcodeForm.code = ''; zipcodeCodeError = null }">
          <option v-for="c in citiesForZipcode" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FloatingSelect>
        <template v-if="zipcodeForm.cityId">
          <div class="field-wrap" style="width: 100%">
            <FloatingInput v-model="zipcodeForm.code" label="Zipcode *" />
            <span v-if="zipcodeCodeError" class="field-error">{{ zipcodeCodeError }}</span>
          </div>
        </template>
        <p v-if="zipcodeFormError" class="error-msg">{{ zipcodeFormError }}</p>
        <div class="form-actions">
          <button class="btn-primary" :disabled="!!zipcodeCodeError" @click="saveZipcode">{{ zipcodeForm.id ? 'Update' : 'Save' }}</button>
          <button class="btn-ghost" @click="forms.zipcode = false">Cancel</button>
        </div>
      </div>
      <DataTable
        v-model:search="zipcode.search"
        v-model:currentPage="zipcode.page"
        v-model:pageSize="zipcode.pageSize"
        :columns="zipcodeColumns"
        :rows="zipcode.rows"
        :loading="zipcode.loading"
        :totalPages="zipcode.totalPages"
        :totalElements="zipcode.totalElements"
        search-placeholder="Search by code…"
        :sortBy="zipcode.sortBy"
        :sortDir="zipcode.sortDir"
        @update:search="onZipcodeSearch"
        @update:currentPage="loadZipcodes"
        @update:pageSize="() => { zipcode.page = 0; loadZipcodes() }"
        @sort="({ sortBy: sb, sortDir: sd }) => { zipcode.sortBy = sb; zipcode.sortDir = sd; zipcode.page = 0; loadZipcodes() }"
      >
        <template #filters>
          <select v-model="zipcode.filterCountryId" class="filter-select" @change="() => { zipcode.filterStateId = ''; zipcode.filterCityId = ''; zipcode.page = 0; loadZipcodes() }">
            <option value="">All Countries</option>
            <option v-for="c in allCountries" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <select v-model="zipcode.filterStateId" class="filter-select" @change="onZipcodeStateFilter">
            <option value="">All States</option>
            <option v-for="s in statesForZipcodeFilter" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <select v-model="zipcode.filterCityId" class="filter-select" @change="() => { zipcode.page = 0; loadZipcodes() }">
            <option value="">All Cities</option>
            <option v-for="c in citiesForZipcodeFilter" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <button v-if="zipcode.filterCountryId || zipcode.filterStateId || zipcode.filterCityId" class="btn-clear-filter" @click="() => { zipcode.filterCountryId = ''; zipcode.filterStateId = ''; zipcode.filterCityId = ''; zipcode.page = 0; loadZipcodes() }">✕ Clear</button>
        </template>
        <template #cell-code="{ value }"><span class="badge">{{ value }}</span></template>
        <template #rowActions="{ row }">
          <button class="btn-icon" @click="editZipcode(row)">✏️</button>
          <button class="btn-icon danger" @click="deleteZipcode(row.id)">🗑️</button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useConfirm } from '@/composables/useConfirm'
import DataTable from '@/components/DataTable.vue'
import FloatingInput from '@/components/FloatingInput.vue'
import FloatingSelect from '@/components/FloatingSelect.vue'
import { locationService, type Country, type State, type City } from '@/services/location-service'

const { confirm } = useConfirm()

const tabs = ['Country', 'State', 'City', 'Zipcode'] as const
type Tab = typeof tabs[number]
const activeTab = ref<Tab>('Country')

// ── Columns ───────────────────────────────────────────
const countryColumns = [
  { key: 'id',       label: '#',            sortable: true  },
  { key: 'flag',     label: '',             sortable: false },
  { key: 'name',     label: 'Name',         sortable: true  },
  { key: 'code',     label: 'Code',         sortable: true  },
  { key: 'dial',     label: 'Dial',         sortable: false },
  { key: 'phoneLen', label: 'Phone Digits', sortable: false },
]
const stateColumns = [
  { key: 'id', label: '#', sortable: true }, { key: 'name', label: 'Name', sortable: true }, { key: 'code', label: 'Code', sortable: true }, { key: 'countryName', label: 'Country' },
]
const cityColumns = [
  { key: 'id', label: '#', sortable: true }, { key: 'name', label: 'Name', sortable: true }, { key: 'stateName', label: 'State' }, { key: 'countryName', label: 'Country' },
]
const zipcodeColumns = [
  { key: 'id', label: '#', sortable: true }, { key: 'code', label: 'Code', sortable: true }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'country', label: 'Country' },
]

// ── Shared reference lists ────────────────────────────
const allCountries = ref<Country[]>([])
const allStates = ref<State[]>([])
const allCities = ref<City[]>([])

// ── Tab state ─────────────────────────────────────────
function tabState() {
  return reactive({
    rows: [] as any[], loading: false,
    search: '', page: 0, pageSize: 5, totalPages: 0, totalElements: 0,
    sortBy: 'createdAt', sortDir: 'desc' as 'asc' | 'desc',
  })
}

const country  = Object.assign(tabState(), {})
const state    = Object.assign(tabState(), { filterCountryId: '' as any })
const city     = Object.assign(tabState(), { filterCountryId: '' as any, filterStateId: '' as any })
const zipcode  = Object.assign(tabState(), { filterCountryId: '' as any, filterStateId: '' as any, filterCityId: '' as any })

// ── Form state ────────────────────────────────────────
const forms = reactive({ country: false, state: false, city: false, zipcode: false })
const countryFormError = ref<string | null>(null)
const countryNameError = ref<string | null>(null)
const countryCodeError = ref<string | null>(null)
const stateFormError   = ref<string | null>(null)
const stateNameError   = ref<string | null>(null)
const stateCodeError   = ref<string | null>(null)
const cityFormError    = ref<string | null>(null)
const cityNameError    = ref<string | null>(null)
const zipcodeFormError = ref<string | null>(null)
const zipcodeCodeError = ref<string | null>(null)
const countryForm = reactive({ id: undefined as number | undefined, name: '', code: '', dial: '', flag: '', phoneLenMin: '' as string | number, phoneLenMax: '' as string | number })
const stateForm   = reactive({ id: undefined as number | undefined, name: '', code: '', countryId: '' as any })
const cityForm    = reactive({ id: undefined as number | undefined, name: '', countryId: '' as any, stateId: '' as any })
const zipcodeForm = reactive({ id: undefined as number | undefined, code: '', countryId: '' as any, stateId: '' as any, cityId: '' as any })

const statesForCity        = computed(() => cityForm.countryId ? allStates.value.filter(s => s.countryId === cityForm.countryId) : allStates.value)
const statesForZipcode     = computed(() => zipcodeForm.countryId ? allStates.value.filter(s => s.countryId === Number(zipcodeForm.countryId)) : allStates.value)
const citiesForZipcode     = computed(() => zipcodeForm.stateId ? allCities.value.filter(c => c.stateId === Number(zipcodeForm.stateId)) : allCities.value)
const statesForCityFilter    = computed(() => city.filterCountryId ? allStates.value.filter(s => s.countryId === Number(city.filterCountryId)) : allStates.value)
const statesForZipcodeFilter = computed(() => zipcode.filterCountryId ? allStates.value.filter(s => s.countryId === Number(zipcode.filterCountryId)) : allStates.value)
const citiesForZipcodeFilter = computed(() => zipcode.filterStateId ? allCities.value.filter(c => c.stateId === Number(zipcode.filterStateId)) : allCities.value)

function toggleForm(tab: keyof typeof forms) {
  if (!forms[tab]) {
    if (tab === 'country') {
      isInitializingCountryForm = true
      countryFormError.value = null; countryNameError.value = null; countryCodeError.value = null
      Object.assign(countryForm, { id: undefined, name: '', code: '', dial: '', flag: '', phoneLenMin: '', phoneLenMax: '' })
      nextTick(() => { isInitializingCountryForm = false })
    }
    if (tab === 'state') {
      isInitializingStateForm = true
      stateFormError.value = null; stateNameError.value = null; stateCodeError.value = null
      Object.assign(stateForm, { id: undefined, name: '', code: '', countryId: '' })
      nextTick(() => { isInitializingStateForm = false })
    }
    if (tab === 'city') {
      isInitializingCityForm = true
      cityFormError.value = null; cityNameError.value = null
      Object.assign(cityForm, { id: undefined, name: '', countryId: '', stateId: '' })
      nextTick(() => { isInitializingCityForm = false })
    }
    if (tab === 'zipcode') {
      isInitializingZipcodeForm = true
      zipcodeFormError.value = null; zipcodeCodeError.value = null
      Object.assign(zipcodeForm, { id: undefined, code: '', countryId: '', stateId: '', cityId: '' })
      nextTick(() => { isInitializingZipcodeForm = false })
    }
  }
  forms[tab] = !forms[tab]
}

function editCountry(row: any) {
  isInitializingCountryForm = true
  countryFormError.value = null
  countryNameError.value = null
  countryCodeError.value = null
  Object.assign(countryForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    dial: row.dial ?? '',
    flag: row.flag ?? '',
    phoneLenMin: row.phoneLenMin ?? '',
    phoneLenMax: row.phoneLenMax ?? '',
  })
  forms.country = true
  nextTick(() => { isInitializingCountryForm = false })
}

let isInitializingCountryForm = false
let isInitializingStateForm = false
let isInitializingCityForm = false
let isInitializingZipcodeForm = false
let nameCheckTimer: ReturnType<typeof setTimeout>
let codeCheckTimer: ReturnType<typeof setTimeout>
let stateNameTimer: ReturnType<typeof setTimeout>
let stateCodeTimer: ReturnType<typeof setTimeout>
let cityNameTimer: ReturnType<typeof setTimeout>
let zipcodeCodeTimer: ReturnType<typeof setTimeout>

watch(() => countryForm.name, (val) => {
  if (isInitializingCountryForm) return
  clearTimeout(nameCheckTimer)
  countryNameError.value = null
  if (!val.trim()) return
  nameCheckTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateCountryName(val.trim(), countryForm.id)
    countryNameError.value = isDup ? 'Name already exists' : null
  }, 400)
})

watch(() => countryForm.code, (val) => {
  if (isInitializingCountryForm) return
  clearTimeout(codeCheckTimer)
  countryCodeError.value = null
  if (!val.trim()) return
  codeCheckTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateCountryCode(val.trim(), countryForm.id)
    countryCodeError.value = isDup ? 'Code already exists' : null
  }, 400)
})

watch(() => stateForm.name, (val) => {
  if (isInitializingStateForm) return
  clearTimeout(stateNameTimer)
  stateNameError.value = null
  if (!val.trim() || !stateForm.countryId) return
  stateNameTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateStateName(val.trim(), stateForm.countryId, stateForm.id)
    stateNameError.value = isDup ? 'Name already exists in this country' : null
  }, 400)
})

watch(() => stateForm.code, (val) => {
  if (isInitializingStateForm) return
  clearTimeout(stateCodeTimer)
  stateCodeError.value = null
  if (!val.trim() || !stateForm.countryId) return
  stateCodeTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateStateCode(val.trim(), stateForm.countryId, stateForm.id)
    stateCodeError.value = isDup ? 'Code already exists in this country' : null
  }, 400)
})

watch(() => stateForm.countryId, () => {
  stateNameError.value = null
  stateCodeError.value = null
})

watch(() => cityForm.name, (val) => {
  if (isInitializingCityForm) return
  clearTimeout(cityNameTimer)
  cityNameError.value = null
  if (!val.trim() || !cityForm.stateId) return
  cityNameTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateCityName(val.trim(), cityForm.stateId, cityForm.id)
    cityNameError.value = isDup ? 'City already exists in this state' : null
  }, 400)
})

watch(() => cityForm.stateId, () => {
  cityNameError.value = null
})

watch(() => zipcodeForm.code, (val) => {
  if (isInitializingZipcodeForm) return
  clearTimeout(zipcodeCodeTimer)
  zipcodeCodeError.value = null
  if (!val.trim() || !zipcodeForm.countryId) return
  zipcodeCodeTimer = setTimeout(async () => {
    const isDup = await locationService.checkDuplicateZipcodeCode(val.trim(), zipcodeForm.countryId, zipcodeForm.id)
    zipcodeCodeError.value = isDup ? 'Zipcode already exists in this country' : null
  }, 400)
})

watch(() => zipcodeForm.cityId, () => {
  zipcodeCodeError.value = null
})

function editState(row: any) {
  isInitializingStateForm = true
  stateFormError.value = null; stateNameError.value = null; stateCodeError.value = null
  Object.assign(stateForm, { id: row.id, name: row.name, code: row.code, countryId: row.countryId || '' })
  forms.state = true
  nextTick(() => { isInitializingStateForm = false })
}
function editCity(row: any) {
  isInitializingCityForm = true
  cityFormError.value = null; cityNameError.value = null
  Object.assign(cityForm, { id: row.id, name: row.name, stateId: row.stateId || '', countryId: row.countryId || '' })
  forms.city = true
  nextTick(() => { isInitializingCityForm = false })
}
function editZipcode(row: any) {
  isInitializingZipcodeForm = true
  zipcodeFormError.value = null; zipcodeCodeError.value = null
  Object.assign(zipcodeForm, { id: row.id, code: row.code, countryId: row.countryId || '', stateId: row.stateId || '', cityId: row.cityId || '' })
  forms.zipcode = true
  nextTick(() => { isInitializingZipcodeForm = false })
}

// ── Load helpers ──────────────────────────────────────
async function loadCountries() {
  country.loading = true
  try {
    const res = await locationService.filterCountries({ page: country.page, size: country.pageSize, sortBy: country.sortBy, sortDir: country.sortDir, name: country.search || undefined })
    country.rows = res.data.content.map((r: any) => ({
      ...r,
      phoneLen: r.phoneLenMin != null && r.phoneLenMax != null
        ? (r.phoneLenMin === r.phoneLenMax ? String(r.phoneLenMin) : `${r.phoneLenMin}–${r.phoneLenMax}`)
        : '—',
    }))
    country.totalPages = res.data.totalPages
    country.totalElements = res.data.totalElements
  } finally { country.loading = false }
}

async function loadStates() {
  state.loading = true
  try {
    const res = await locationService.filterStates({ page: state.page, size: state.pageSize, sortBy: state.sortBy, sortDir: state.sortDir, name: state.search || undefined, countryId: state.filterCountryId || undefined })
    state.rows = res.data.content; state.totalPages = res.data.totalPages; state.totalElements = res.data.totalElements
  } finally { state.loading = false }
}

async function loadCities() {
  city.loading = true
  try {
    const res = await locationService.filterCities({ page: city.page, size: city.pageSize, sortBy: city.sortBy, sortDir: city.sortDir, name: city.search || undefined, countryId: city.filterCountryId || undefined, stateId: city.filterStateId || undefined })
    city.rows = res.data.content; city.totalPages = res.data.totalPages; city.totalElements = res.data.totalElements
  } finally { city.loading = false }
}

async function loadZipcodes() {
  zipcode.loading = true
  try {
    const res = await locationService.filterZipcodes({ page: zipcode.page, size: zipcode.pageSize, sortBy: zipcode.sortBy, sortDir: zipcode.sortDir, code: zipcode.search || undefined, countryId: zipcode.filterCountryId || undefined, stateId: zipcode.filterStateId || undefined, cityId: zipcode.filterCityId || undefined })
    zipcode.rows = res.data.content; zipcode.totalPages = res.data.totalPages; zipcode.totalElements = res.data.totalElements
  } finally { zipcode.loading = false }
}

// ── Debounced search ──────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout>
function debounce(fn: () => void) { clearTimeout(searchTimer); searchTimer = setTimeout(fn, 350) }
function onCountrySearch() { country.page = 0; debounce(loadCountries) }
function onStateSearch()   { state.page = 0;   debounce(loadStates) }
function onCitySearch()    { city.page = 0;    debounce(loadCities) }
function onZipcodeSearch() { zipcode.page = 0; debounce(loadZipcodes) }

function onCityCountryFilter()    { city.filterStateId = ''; city.page = 0; loadCities() }
function onZipcodeStateFilter()   { zipcode.filterCityId = ''; zipcode.page = 0; loadZipcodes() }

// ── Save / Delete ─────────────────────────────────────
async function saveCountry() {
  countryFormError.value = null
  if (!countryForm.name.trim() || !countryForm.code.trim()) {
    countryFormError.value = 'Country name and code are required'
    return
  }
  if (countryNameError.value || countryCodeError.value) return
  const minLen = countryForm.phoneLenMin !== '' ? Number(countryForm.phoneLenMin) : undefined
  const maxLen = countryForm.phoneLenMax !== '' ? Number(countryForm.phoneLenMax) : undefined
  try {
    await locationService.saveCountry({
      id: countryForm.id,
      name: countryForm.name.trim(),
      code: countryForm.code.trim().toUpperCase(),
      dial: countryForm.dial.trim() || undefined,
      flag: countryForm.flag.trim() || undefined,
      phoneLenMin: minLen,
      phoneLenMax: maxLen,
    })
    Object.assign(countryForm, { id: undefined, name: '', code: '', dial: '', flag: '', phoneLenMin: '', phoneLenMax: '' })
    countryFormError.value = null; countryNameError.value = null; countryCodeError.value = null
    forms.country = false; country.page = 0; await loadCountries()
  } catch (e: any) {
    countryFormError.value = e.message
  }
}
async function deleteCountry(id: number) {
  if (!await confirm('Delete country?')) return
  try { await locationService.deleteCountry(id) } catch (e: any) { alert(e.message); return }
  await loadCountries()
}

async function saveState() {
  stateFormError.value = null
  if (!stateForm.name.trim() || !stateForm.code.trim() || !stateForm.countryId) {
    stateFormError.value = 'State name, code and country are required'
    return
  }
  if (stateNameError.value || stateCodeError.value) return
  try {
    await locationService.saveState({ id: stateForm.id, name: stateForm.name.trim(), code: stateForm.code.trim().toUpperCase(), countryId: stateForm.countryId })
    Object.assign(stateForm, { id: undefined, name: '', code: '', countryId: '' })
    stateFormError.value = null; stateNameError.value = null; stateCodeError.value = null
    forms.state = false; state.page = 0
    await Promise.all([loadStates(), locationService.getStates().then(r => allStates.value = r)])
  } catch (e: any) {
    stateFormError.value = e.message
  }
}
async function deleteState(id: number) {
  if (!await confirm('Delete state?')) return
  try { await locationService.deleteState(id) } catch (e: any) { alert(e.message); return }
  await loadStates()
}

async function saveCity() {
  cityFormError.value = null
  if (!cityForm.name.trim() || !cityForm.stateId) {
    cityFormError.value = 'City name and state are required'
    return
  }
  if (cityNameError.value) return
  try {
    await locationService.saveCity({ id: cityForm.id, name: cityForm.name.trim(), stateId: cityForm.stateId })
    Object.assign(cityForm, { id: undefined, name: '', countryId: '', stateId: '' })
    cityFormError.value = null; cityNameError.value = null
    forms.city = false; city.page = 0
    await Promise.all([loadCities(), locationService.getCities().then(r => allCities.value = r)])
  } catch (e: any) {
    cityFormError.value = e.message
  }
}
async function deleteCity(id: number) {
  if (!await confirm('Delete city?')) return
  try { await locationService.deleteCity(id) } catch (e: any) { alert(e.message); return }
  await loadCities()
}

async function saveZipcode() {
  zipcodeFormError.value = null
  if (!zipcodeForm.code.trim() || !zipcodeForm.cityId) {
    zipcodeFormError.value = 'Zipcode and city are required'
    return
  }
  if (zipcodeCodeError.value) return
  try {
    await locationService.saveZipcode({ id: zipcodeForm.id, code: zipcodeForm.code.trim(), cityId: zipcodeForm.cityId })
    Object.assign(zipcodeForm, { id: undefined, code: '', countryId: '', stateId: '', cityId: '' })
    zipcodeFormError.value = null; zipcodeCodeError.value = null
    forms.zipcode = false; zipcode.page = 0
    await loadZipcodes()
  } catch (e: any) {
    zipcodeFormError.value = e.message
  }
}
async function deleteZipcode(id: number) {
  if (!await confirm('Delete zipcode?')) return
  try { await locationService.deleteZipcode(id) } catch (e: any) { alert(e.message); return }
  await loadZipcodes()
}

// ── Tab switch ────────────────────────────────────────
watch(activeTab, async (tab) => {
  if (tab === 'Country') loadCountries()
  if (tab === 'State')   { if (!allCountries.value.length) allCountries.value = await locationService.getCountries(); loadStates() }
  if (tab === 'City')    { if (!allCountries.value.length) allCountries.value = await locationService.getCountries(); if (!allStates.value.length) allStates.value = await locationService.getStates().catch(() => []); loadCities() }
  if (tab === 'Zipcode') { if (!allCountries.value.length) allCountries.value = await locationService.getCountries(); if (!allStates.value.length) allStates.value = await locationService.getStates().catch(() => []); if (!allCities.value.length) allCities.value = await locationService.getCities(); loadZipcodes() }
})

onMounted(async () => {
  allCountries.value = await locationService.getCountries()
  loadCountries()
})
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
.field-wrap { flex: 1; display: flex; flex-direction: column; gap: 4px; align-self: flex-start; width: 0; min-width: 0; }
.field-wrap :deep(.fi-wrap) { width: 100%; }
.field-error { color: #ef4444; font-size: 11px; padding-left: 2px; white-space: nowrap; }
.form-actions { display: flex; gap: 12px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #6c72ff; }
.btn-clear-filter { background: transparent; border: 1px solid #4a5580; border-radius: 8px; padding: 7px 12px; color: #aeb9e1; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn-clear-filter:hover { border-color: #ef4444; color: #ef4444; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.badge--dial { background: #1e3a5f; color: #a78bfa; }
.badge--len { background: #1e3a5f; color: #34d399; }
.country-flag { font-size: 20px; line-height: 1; display: inline-block; }
</style>
