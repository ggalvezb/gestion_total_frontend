<!-- AppBadge.vue -->
<template>
  <span :style="style">{{ label }}</span>
</template>
<script setup>
const props = defineProps({ estado: String, label: String })
const map = {
  draft:    { bg: 'var(--surface3)',     color: 'var(--text2)',   border: '1px solid var(--border2)' },
  sent:     { bg: 'var(--info-dim)',     color: '#7aafd4',        border: '1px solid rgba(90,143,196,.3)' },
  approved: { bg: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(106,170,122,.3)' },
  buying:   { bg: 'var(--accent-dim)',  color: 'var(--accent)',  border: '1px solid rgba(201,168,76,.3)' },
  done:     { bg: 'rgba(106,170,122,.1)', color: '#4e9660',      border: '1px solid rgba(106,170,122,.2)' },
  shipped:  { bg: 'rgba(20,184,166,.1)', color: '#0d9488',       border: '1px solid rgba(20,184,166,.2)' },
  rejected: { bg: 'var(--danger-dim)', color: 'var(--danger)',   border: '1px solid rgba(196,92,58,.25)' },
  desert:   { bg: 'rgba(139,92,246,.1)', color: '#8b5cf6',       border: '1px solid rgba(139,92,246,.25)' },
}
const s = map[props.estado] || map.draft
const style = {
  display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
  borderRadius: '20px', fontSize: '11px', fontWeight: 600, letterSpacing: '.04em',
  background: s.bg, color: s.color, border: s.border, whiteSpace: 'nowrap',
}
</script>
