<template>
  <div style="display:flex;flex-direction:column;gap:5px">
    <label v-if="label" :style="lblStyle">{{ label }}</label>
    <input v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :style="inputStyle" />
    <span v-if="error" style="font-size:11px;color:var(--danger)">{{ error }}</span>
  </div>
</template>
<script setup>
defineProps({ label: String, modelValue: [String, Number], error: String, mono: Boolean })
defineEmits(['update:modelValue'])
const lblStyle = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600 }
const inputStyle = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 12px', color:'var(--text)', fontFamily:"'Instrument Sans', sans-serif", fontSize:'13px', outline:'none' }
</script>
