<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div v-if="visible" class="cd-overlay" @click.self="answer(false)">
        <div class="cd-dialog" role="alertdialog" aria-modal="true">
          <div class="cd-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#f87171" stroke-width="1.8"/>
              <path d="M12 7v5" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="16.5" r="1" fill="#f87171"/>
            </svg>
          </div>
          <h3 class="cd-title">{{ title }}</h3>
          <p class="cd-message">{{ message }}</p>
          <div class="cd-actions">
            <button class="cd-btn cd-cancel" @click="answer(false)">Cancel</button>
            <button class="cd-btn cd-delete" @click="answer(true)">Delete</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useConfirm } from '@/composables/useConfirm'
const { visible, message, title, answer } = useConfirm()
</script>

<style scoped>
.cd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.cd-dialog {
  background: #1a2240;
  border: 1.5px solid #2d3a60;
  border-radius: 14px;
  padding: 32px 28px 24px;
  width: 340px;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}

.cd-icon { margin-bottom: 4px; }

.cd-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.cd-message {
  margin: 0;
  font-size: 14px;
  color: #aeb9e1;
  text-align: center;
  line-height: 1.5;
}

.cd-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

.cd-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}

.cd-btn:hover { opacity: 0.88; }

.cd-cancel {
  background: #2a3660;
  color: #aeb9e1;
  border: 1px solid #3a4870;
}

.cd-delete {
  background: #ef4444;
  color: #fff;
}

/* Transition */
.cd-fade-enter-active, .cd-fade-leave-active { transition: opacity 0.18s ease; }
.cd-fade-enter-from, .cd-fade-leave-to { opacity: 0; }
</style>
