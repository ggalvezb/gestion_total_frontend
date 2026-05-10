<template>
  <div :style="{width:size+'px',height:size+'px',borderRadius:'50%',border:'2px solid var(--border2)',borderTopColor:'var(--accent)',animation:'spin .7s linear infinite',flexShrink:0}" />
</template>
<script setup>
defineProps({ size: { type: Number, default: 18 } })
</script>
