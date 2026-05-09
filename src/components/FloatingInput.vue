<template>
  <div class="fi-wrap" :class="{ 'fi--focused': isFocused, 'fi--filled': hasValue }">
    <input
      v-bind="$attrs"
      :type="type || 'text'"
      :value="modelValue ?? ''"
      class="fi-input"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <label class="fi-label">{{ label }}</label>
    <fieldset class="fi-fieldset" aria-hidden="true">
      <legend class="fi-legend"><span>{{ label }}</span></legend>
    </fieldset>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{ modelValue?: string | number | null; label: string; type?: string }>()
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const isFocused = ref(false)
const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '')
</script>

<style scoped>
.fi-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

/* ── Input ─────────────────────────────────────────── */
.fi-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  display: block;
}

/* Remove number input arrows */
.fi-input[type='number']::-webkit-inner-spin-button,
.fi-input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; }
.fi-input[type='number'] { -moz-appearance: textfield; }

/* ── Floating label ────────────────────────────────── */
.fi-label {
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

.fi-wrap.fi--focused .fi-label,
.fi-wrap.fi--filled .fi-label {
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
}

.fi-wrap.fi--focused .fi-label  { color: #6c72ff; }
.fi-wrap.fi--filled .fi-label   { color: #aeb9e1; }
.fi-wrap.fi--focused.fi--filled .fi-label { color: #6c72ff; }

/* ── Fieldset border (Material outlined trick) ─────── */
.fi-fieldset {
  position: absolute;
  inset: -6px 0 0;
  border: 1.5px solid #4a5580;
  border-radius: 8px;
  margin: 0;
  padding: 0 8px;
  pointer-events: none;
  transition: border-color 0.18s ease;
}

.fi-wrap.fi--focused .fi-fieldset { border-color: #6c72ff; border-width: 2px; }

/* ── Legend notch — creates the gap the label sits in ─ */
.fi-legend {
  display: block;
  height: 11px;
  font-size: 11px;
  max-width: 0.01px;          /* collapsed by default = no gap */
  overflow: hidden;
  transition: max-width 0.18s ease;
  white-space: nowrap;
  padding: 0;
  visibility: hidden;
}

.fi-legend span { padding: 0 4px; }

.fi-wrap.fi--focused .fi-legend,
.fi-wrap.fi--filled .fi-legend {
  max-width: 100%;            /* opens the notch */
}
</style>
