<template>
  <div class="fs-wrap" :class="{ 'fs--focused': isFocused, 'fs--filled': hasValue }">
    <select
      v-bind="$attrs"
      :value="modelValue"
      class="fs-select"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled hidden />
      <slot />
    </select>
    <label class="fs-label">{{ label }}</label>
    <span class="fs-arrow" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <fieldset class="fs-fieldset" aria-hidden="true">
      <legend class="fs-legend"><span>{{ label }}</span></legend>
    </fieldset>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{ modelValue?: string | number | null; label: string }>()
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const isFocused = ref(false)
const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '' && props.modelValue !== 0)
</script>

<style scoped>
.fs-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

/* ── Select ────────────────────────────────────────── */
.fs-select {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 36px 10px 14px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  display: block;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.fs-select option {
  background: #212c4d;
  color: #fff;
}

/* ── Custom arrow ──────────────────────────────────── */
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

/* ── Floating label ────────────────────────────────── */
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

.fs-wrap.fs--focused .fs-label           { color: #6c72ff; }
.fs-wrap.fs--filled .fs-label            { color: #aeb9e1; }
.fs-wrap.fs--focused.fs--filled .fs-label { color: #6c72ff; }

/* ── Fieldset border ───────────────────────────────── */
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

/* ── Legend notch ──────────────────────────────────── */
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
.fs-wrap.fs--filled .fs-legend {
  max-width: 100%;
}
</style>
