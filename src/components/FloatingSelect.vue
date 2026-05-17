<template>
  <div
    class="fs-wrap"
    :class="{ 'fs--focused': open, 'fs--filled': hasValue, 'fs--disabled': disabled }"
    ref="wrapRef"
    :tabindex="disabled ? -1 : 0"
    @click="!disabled && toggle()"
    @keydown.esc="close"
    @keydown.enter.prevent="!disabled && (open ? pickFocused() : openDrop())"
    @keydown.space.prevent="!disabled && !open && openDrop()"
    @keydown.arrow-down.prevent="!disabled && (open ? focusNext() : openDrop())"
    @keydown.arrow-up.prevent="!disabled && open && focusPrev()"
    @blur="onBlur"
  >
    <div class="fs-value">{{ selectedLabel }}</div>
    <label class="fs-label">{{ label }}</label>
    <span class="fs-arrow" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <fieldset class="fs-fieldset" aria-hidden="true">
      <legend class="fs-legend"><span>{{ label }}</span></legend>
    </fieldset>

    <div class="fs-slot-hidden" aria-hidden="true"><slot /></div>

    <Teleport to="body">
      <div v-if="open" class="fs-dropdown" :style="pos" ref="dropRef" @mousedown.prevent>
        <div class="fs-search-wrap">
          <input
            ref="searchRef"
            v-model="searchQuery"
            class="fs-search"
            placeholder="Search…"
            @keydown.esc.stop="close"
            @keydown.enter.prevent="pickFocused"
            @keydown.arrow-down.prevent="focusNext"
            @keydown.arrow-up.prevent="focusPrev"
          />
        </div>
        <ul class="fs-list">
          <li v-if="visibleItems.length === 0" class="fs-empty">No data found</li>
          <template v-else v-for="(item, i) in visibleItems" :key="item.key">
            <li v-if="item.isGroup" class="fs-optgroup-label">{{ item.label }}</li>
            <li
              v-else
              class="fs-option"
              :class="{
                'fs-option--sel': item.value === String(modelValue ?? ''),
                'fs-option--focus': i === focusIdx
              }"
              @mouseenter="focusIdx = i"
              @click.stop="pick(item.value!)"
            >{{ item.label }}</li>
          </template>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, useSlots, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue?: string | number | null
  label: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
defineOptions({ inheritAttrs: false })

// ── Slot parsing ──────────────────────────────────────────────────────────────
interface FlatItem { key: string; isGroup: boolean; label: string; value?: string }

const slots = useSlots()

type VNodeRaw = Record<string, unknown>

function vnodeText(children: unknown): string {
  if (!children) return ''
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(vnodeText).join('')
  if (typeof children === 'object') {
    const c = children as VNodeRaw
    if (c['children'] !== undefined) return vnodeText(c['children'])
  }
  return ''
}

function parseNodes(nodes: unknown): FlatItem[] {
  if (!nodes) return []
  if (Array.isArray(nodes)) return nodes.flatMap((n: unknown) => parseNodes(n))
  if (typeof nodes !== 'object') return []

  const vn = nodes as VNodeRaw
  const type = vn['type']
  const p = vn['props'] as VNodeRaw | undefined
  const children = vn['children']

  if (type === 'option') {
    if (p?.['disabled'] || p?.['hidden']) return []
    return [{ key: `opt-${p?.['value'] ?? Math.random()}`, isGroup: false, label: vnodeText(children), value: String(p?.['value'] ?? '') }]
  }

  if (type === 'optgroup') {
    const gl = String(p?.['label'] ?? '')
    const ch = children as VNodeRaw | undefined
    const kids = typeof ch?.['default'] === 'function' ? (ch['default'] as () => unknown)() : Array.isArray(children) ? children : []
    return [{ key: `grp-${gl}`, isGroup: true, label: gl }, ...parseNodes(kids)]
  }

  if (children) {
    const ch = children as VNodeRaw
    const kids = typeof children === 'function'
      ? (children as () => unknown)()
      : typeof ch['default'] === 'function'
        ? (ch['default'] as () => unknown)()
        : Array.isArray(children) ? children : []
    return parseNodes(kids)
  }

  return []
}

const flatItems = computed<FlatItem[]>(() => parseNodes(slots.default?.() ?? []))

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return ''
  return flatItems.value.find(i => !i.isGroup && i.value === String(props.modelValue))?.label ?? ''
})

const hasValue = computed(() => selectedLabel.value !== '')

// ── Search ────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const searchRef = ref<HTMLInputElement | null>(null)

const visibleItems = computed<FlatItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return flatItems.value
  const out: FlatItem[] = []
  let pendingGroup: FlatItem | null = null
  for (const item of flatItems.value) {
    if (item.isGroup) { pendingGroup = item; continue }
    if (item.label.toLowerCase().includes(q)) {
      if (pendingGroup) { out.push(pendingGroup); pendingGroup = null }
      out.push(item)
    }
  }
  return out
})

// ── Dropdown open / close ─────────────────────────────────────────────────────
const wrapRef = ref<HTMLElement | null>(null)
const dropRef = ref<HTMLElement | null>(null)
const open = ref(false)
const pos = ref<Record<string, string>>({})
const focusIdx = ref(-1)

async function openDrop() {
  const r = wrapRef.value?.getBoundingClientRect()
  open.value = true
  searchQuery.value = ''
  focusIdx.value = visibleItems.value.findIndex(i => !i.isGroup && i.value === String(props.modelValue ?? ''))
  if (r) {
    const dropHeight = 280
    const spaceBelow = window.innerHeight - r.bottom
    const openAbove = spaceBelow < dropHeight && r.top > dropHeight
    pos.value = {
      position: 'fixed',
      left: `${r.left}px`,
      width: `${r.width}px`,
      zIndex: '9999',
      ...(openAbove
        ? { bottom: `${window.innerHeight - r.top + 4}px`, top: 'auto' }
        : { top: `${r.bottom + 4}px`, bottom: 'auto' }),
    }
  }
  await nextTick()
  searchRef.value?.focus()
}

function toggle() { if (open.value) { close() } else { void openDrop() } }
function close() { open.value = false; searchQuery.value = '' }

function pick(value: string) { emit('update:modelValue', value); close() }

function focusNext() {
  const items = visibleItems.value
  if (!items.length) return
  let i = focusIdx.value
  do { i = (i + 1) % items.length } while (items[i].isGroup)
  focusIdx.value = i
}

function focusPrev() {
  const items = visibleItems.value
  if (!items.length) return
  let i = focusIdx.value < 0 ? items.length : focusIdx.value
  do { i = (i - 1 + items.length) % items.length } while (items[i].isGroup)
  focusIdx.value = i
}

function pickFocused() {
  const item = visibleItems.value[focusIdx.value]
  if (item && !item.isGroup) pick(item.value!)
}

function onBlur(e: FocusEvent) {
  if (!dropRef.value?.contains(e.relatedTarget as Node)) close()
}

function onDocMousedown(e: MouseEvent) {
  const t = e.target as Node
  if (open.value && !wrapRef.value?.contains(t) && !dropRef.value?.contains(t)) close()
}

onMounted(() => document.addEventListener('mousedown', onDocMousedown))
onUnmounted(() => document.removeEventListener('mousedown', onDocMousedown))
</script>

<style scoped>
.fs-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.fs-wrap.fs--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* ── Display value ─────────────────────────────────────── */
.fs-value {
  width: 100%;
  padding: 10px 36px 10px 14px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  min-height: 42px;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Custom arrow ──────────────────────────────────────── */
.fs-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #aeb9e1;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  transition: color 0.18s ease, transform 0.18s ease;
}

.fs-wrap.fs--focused .fs-arrow {
  color: #6c72ff;
  transform: translateY(-50%) rotate(180deg);
}

/* ── Floating label ────────────────────────────────────── */
.fs-label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #aeb9e1;
  pointer-events: none;
  transition: top 0.18s ease, font-size 0.18s ease, color 0.18s ease, transform 0.18s ease;
  z-index: 2;
  line-height: 1;
  white-space: nowrap;
}

.fs-wrap.fs--focused .fs-label,
.fs-wrap.fs--filled .fs-label {
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
}

.fs-wrap.fs--focused .fs-label            { color: #6c72ff; }
.fs-wrap.fs--filled .fs-label             { color: #aeb9e1; }
.fs-wrap.fs--focused.fs--filled .fs-label  { color: #6c72ff; }

/* ── Fieldset border ───────────────────────────────────── */
.fs-fieldset {
  position: absolute;
  inset: -6px 0 0;
  border: 1.5px solid #4a5580;
  border-radius: 8px;
  margin: 0;
  padding: 0 8px;
  pointer-events: none;
  transition: border-color 0.18s ease;
}

.fs-wrap.fs--focused .fs-fieldset { border-color: #6c72ff; border-width: 2px; }

/* ── Legend notch ──────────────────────────────────────── */
.fs-legend {
  display: block;
  height: 11px;
  font-size: 11px;
  max-width: 0.01px;
  overflow: hidden;
  transition: max-width 0.18s ease;
  white-space: nowrap;
  padding: 0;
  visibility: hidden;
}

.fs-legend span { padding: 0 4px; }

.fs-wrap.fs--focused .fs-legend,
.fs-wrap.fs--filled .fs-legend { max-width: 100%; }

.fs-slot-hidden { display: none; }
</style>

<!-- Dropdown is teleported to body — cannot use scoped styles -->
<style>
.fs-dropdown {
  background: #1a2240;
  border: 1.5px solid #4a5580;
  border-radius: 8px;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  list-style: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.fs-option {
  padding: 10px 14px;
  color: #c8d0e8;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s;
}

.fs-option:hover,
.fs-option--focus {
  background: #2a3660;
  color: #fff;
}

.fs-option--sel {
  color: #6c72ff;
  font-weight: 500;
}

.fs-option--sel.fs-option--focus,
.fs-option--sel:hover {
  background: #2a3660;
}

.fs-search-wrap {
  padding: 8px 8px 6px;
  border-bottom: 1px solid #2d3a60;
}

.fs-search {
  width: 100%;
  background: #212c4d;
  border: 1px solid #3a4870;
  border-radius: 6px;
  outline: none;
  padding: 7px 10px;
  color: #fff;
  font-size: 13px;
  box-sizing: border-box;
}

.fs-search::placeholder { color: #4a5580; }
.fs-search:focus { border-color: #6c72ff; }

.fs-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a5580 transparent;
}

.fs-empty {
  padding: 12px 14px;
  color: #6a78a0;
  font-size: 13px;
  text-align: center;
}

.fs-optgroup-label {
  padding: 6px 14px 4px;
  color: #6a78a0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: default;
}
</style>

CRCPRD  CRCSUM
