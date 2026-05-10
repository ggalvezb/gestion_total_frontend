<template>
  <button :style="btnStyle" :disabled="disabled" :type="type" @click="$emit('click')">
    <slot />
  </button>
</template>
<script setup>
import { computed } from 'vue'
defineEmits(['click'])
const props = defineProps({
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  disabled:{ type: Boolean, default: false },
  type:    { type: String, default: 'button' },
})
const sizes   = { sm: '6px 14px', md: '10px 20px', lg: '12px 24px' }
const fSizes  = { sm: '12px', md: '13px', lg: '14px' }
const variants = {
  primary: { background: 'var(--accent)',      color: '#0f0e0c',      border: 'none' },
  ghost:   { background: 'transparent',        color: 'var(--text2)', border: '1px solid var(--border)' },
  danger:  { background: 'transparent',        color: 'var(--danger)',border: '1px solid rgba(196,92,58,.3)' },
  dashed:  { background: 'transparent',        color: 'var(--text3)', border: '1px dashed var(--border)' },
}
const btnStyle = computed(() => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
  borderRadius: '6px', cursor: props.disabled ? 'not-allowed' : 'pointer',
  transition: 'all .15s', letterSpacing: '.02em', whiteSpace: 'nowrap',
  padding: sizes[props.size], fontSize: fSizes[props.size],
  opacity: props.disabled ? .5 : 1,
  ...variants[props.variant],
}))
</script>
