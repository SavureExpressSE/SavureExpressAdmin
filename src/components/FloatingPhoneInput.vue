<template>
  <div class="fp-outer" ref="wrapRef">
  <div class="fp-wrap" :class="{ 'fp--focused': isFocused, 'fp--filled': hasValue, 'fp--error': !!phoneError }">
    <!-- Country code trigger -->
    <button type="button" class="fp-trigger" @click="toggleOpen">
      <span class="fp-flag">{{ selected.flag }}</span>
      <span class="fp-dial">{{ selected.dial }}</span>
      <svg class="fp-caret" :class="{ 'fp-caret--open': open }" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <span class="fp-sep" />
    <!-- Number input -->
    <input
      class="fp-number"
      type="tel"
      inputmode="numeric"
      :value="number"
      :maxlength="selected.len[1]"
      @focus="isFocused = true"
      @blur="isFocused = false; touched = true"
      @input="onInput"
    />
    <!-- Floating label -->
    <label class="fp-label">{{ label }}</label>
    <fieldset class="fp-fieldset" aria-hidden="true">
      <legend class="fp-legend"><span>{{ label }}</span></legend>
    </fieldset>
    <!-- Country dropdown -->
    <div v-if="open" class="fp-dropdown" @click.stop>
      <input
        ref="searchRef"
        v-model="query"
        class="fp-search"
        placeholder="Search country or code…"
        @keydown.esc="open = false"
        @click.stop
      />
      <div class="fp-list">
        <div
          v-for="c in filtered"
          :key="c.iso"
          class="fp-item"
          :class="{ 'fp-item--active': c.iso === selected.iso }"
          @mousedown.prevent="pick(c)"
        >
          <span class="fp-item-flag">{{ c.flag }}</span>
          <span class="fp-item-name">{{ c.name }}</span>
          <span class="fp-item-dial">{{ c.dial }}</span>
        </div>
        <div v-if="filtered.length === 0" class="fp-empty">No match</div>
      </div>
    </div>
  </div>
  <span v-if="phoneError" class="fp-error">{{ phoneError }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PHONE_COUNTRIES } from '@/utils/phone-countries'
import type { PhoneCountry } from '@/utils/phone-countries'
import { locationService } from '@/services/location-service'

const countries = ref<PhoneCountry[]>(PHONE_COUNTRIES)
const sortedByDial = computed(() =>
  [...countries.value].sort((a, b) => b.dial.length - a.dial.length)
)

const DEFAULT_ISO = 'IN'
const DEFAULT = computed(() => countries.value.find(c => c.iso === DEFAULT_ISO) ?? countries.value[0])

const props = defineProps<{ modelValue?: string | null; label: string }>()
const emit  = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const isFocused = ref(false)
const open      = ref(false)
const query     = ref('')
const number    = ref('')
const selected  = ref<PhoneCountry>(DEFAULT.value)
const touched   = ref(false)
const wrapRef   = ref<HTMLElement>()
const searchRef = ref<HTMLInputElement>()

const hasValue = computed(() => !!number.value)

const phoneError = computed(() => {
  if (!touched.value || !number.value) return null
  const [min, max] = selected.value.len
  if (number.value.length < min) return `Enter ${min === max ? min : `${min}–${max}`} digit number`
  if (number.value.length > max) return `Maximum ${max} digits`
  return null
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return countries.value
  return countries.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso.toLowerCase().includes(q)
  )
})

function parse(val: string) {
  if (!val) { number.value = ''; selected.value = DEFAULT.value; return }
  for (const c of sortedByDial.value) {
    if (val.startsWith(c.dial)) {
      selected.value = c
      number.value   = val.slice(c.dial.length)
      return
    }
  }
  number.value = val
}

watch(() => props.modelValue, v => parse(v ?? ''), { immediate: true })

function onInput(e: Event) {
  const max = selected.value.len[1]
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, max)
  number.value = raw
  ;(e.target as HTMLInputElement).value = raw
  emit('update:modelValue', selected.value.dial + raw)
}

function pick(c: PhoneCountry) {
  selected.value = c
  open.value     = false
  query.value    = ''
  emit('update:modelValue', c.dial + number.value)
}

async function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    searchRef.value?.focus()
  }
}

function onOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    open.value  = false
    query.value = ''
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', onOutside)
  try {
    const apiCountries = await locationService.getCountries()
    const mapped: PhoneCountry[] = apiCountries
      .filter(c => c.dial && c.flag && c.phoneLenMin != null && c.phoneLenMax != null)
      .map(c => ({
        iso: c.code,
        name: c.name,
        dial: c.dial!,
        flag: c.flag!,
        len: [c.phoneLenMin!, c.phoneLenMax!] as [number, number],
      }))
    if (mapped.length > 0) {
      countries.value = mapped
      if (!props.modelValue) selected.value = DEFAULT.value
    }
  } catch {
    // fallback: keep static PHONE_COUNTRIES
  }
})
onUnmounted(() => document.removeEventListener('mousedown', onOutside))
</script>

<style scoped>
.fp-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

/* ── Trigger ──────────────────────────────────────── */
.fp-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 8px 10px 14px;
  cursor: pointer;
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.fp-flag { font-size: 18px; line-height: 1; }
.fp-dial { color: #aeb9e1; font-size: 13px; }

.fp-caret {
  color: #aeb9e1;
  transition: transform 0.18s ease, color 0.18s ease;
  flex-shrink: 0;
}
.fp-caret--open { transform: rotate(180deg); }
.fp-wrap.fp--focused .fp-caret { color: #6c72ff; }

/* ── Separator ────────────────────────────────────── */
.fp-sep {
  width: 1px;
  height: 20px;
  background: #4a5580;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* ── Number input ─────────────────────────────────── */
.fp-number {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

/* Remove number input arrows */
.fp-number::-webkit-inner-spin-button,
.fp-number::-webkit-outer-spin-button { -webkit-appearance: none; }

/* ── Floating label — always floated since trigger occupies left side ─ */
.fp-label {
  position: absolute;
  left: 14px;
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
  color: #aeb9e1;
  pointer-events: none;
  z-index: 2;
  line-height: 1;
  white-space: nowrap;
}

.fp-wrap.fp--focused .fp-label { color: #6c72ff; }

/* ── Fieldset border ──────────────────────────────── */
.fp-fieldset {
  position: absolute;
  inset: -6px 0 0;
  border: 1.5px solid #4a5580;
  border-radius: 8px;
  margin: 0;
  padding: 0 8px;
  pointer-events: none;
  transition: border-color 0.18s ease;
}
.fp-wrap.fp--focused .fp-fieldset { border-color: #6c72ff; border-width: 2px; }

/* ── Legend notch ─────────────────────────────────── */
.fp-legend {
  display: block;
  height: 11px;
  font-size: 11px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  padding: 0;
  visibility: hidden;
}
.fp-legend span { padding: 0 4px; }

/* ── Dropdown ─────────────────────────────────────── */
.fp-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 280px;
  background: #1a2240;
  border: 1px solid #4a5580;
  border-radius: 10px;
  z-index: 100;
  box-shadow: 0 8px 28px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fp-search {
  background: #212c4d;
  border: none;
  border-bottom: 1px solid #37446b;
  outline: none;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}
.fp-search::placeholder { color: #4a5580; }

.fp-list {
  max-height: 220px;
  overflow-y: auto;
}
.fp-list::-webkit-scrollbar { width: 4px; }
.fp-list::-webkit-scrollbar-track { background: transparent; }
.fp-list::-webkit-scrollbar-thumb { background: #37446b; border-radius: 2px; }

.fp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background 0.12s;
  font-size: 13px;
  color: #d1dbf9;
}
.fp-item:hover { background: #2a3a5e; }
.fp-item--active { background: #1e3060; }
.fp-item--active .fp-item-name { color: #6c72ff; }

.fp-item-flag { font-size: 18px; flex-shrink: 0; }
.fp-item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-item-dial { color: #57c3ff; font-size: 12px; flex-shrink: 0; }

.fp-empty { padding: 14px; color: #4a5580; font-size: 13px; text-align: center; }

/* ── Error state ──────────────────────────────────── */
.fp-outer { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.fp-wrap.fp--error .fp-fieldset { border-color: #f87171; }
.fp-wrap.fp--error .fp-label    { color: #f87171; }
.fp-error {
  font-size: 11px;
  color: #f87171;
  padding-left: 14px;
  line-height: 1.3;
}
</style>
