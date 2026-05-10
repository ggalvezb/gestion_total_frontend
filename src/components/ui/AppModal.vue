<!-- AppModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" @click.self="$emit('close')" :style="overlayStyle">
        <div :style="boxStyle">
          <div v-if="title" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <div style="font-family:'DM Serif Display',serif;font-size:18px">{{ title }}</div>
            <button @click="$emit('close')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:20px">×</button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

defineProps({ open: Boolean, title: String, width: { type: Number, default: 480 } })
defineEmits(['close'])

const { isMobile } = useBreakpoint()

const overlayStyle = computed(() => isMobile.value
  ? { position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:1000 }
  : { position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }
)

const boxStyle = computed(() => isMobile.value
  ? { background:'var(--surface)',borderTop:'1px solid var(--border)',borderRadius:'16px 16px 0 0',padding:'24px 20px',width:'100%',maxHeight:'90vh',overflowY:'auto' }
  : { background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'28px',width:'480px',maxWidth:'100%',maxHeight:'90vh',overflowY:'auto' }
)
</script>
<style>
.modal-enter-active,.modal-leave-active{transition:all .2s ease}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
