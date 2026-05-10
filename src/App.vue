<template>
  <RouterView />
  <!-- Toast container -->
  <div style="position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :style="toastStyle(t.type)"
      >
        <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}</span>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()

const toastStyle = (type) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 16px',
  fontFamily: "'Instrument Sans', sans-serif", fontSize: 13,
  color: type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--text)',
  boxShadow: '0 8px 24px rgba(0,0,0,.4)', minWidth: 260, maxWidth: 380,
})
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }
</style>
