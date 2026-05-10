<template>
  <div :style="wrapStyle">
    <div :style="gridStyle" />
    <div :style="haloStyle" />

    <div class="fade-in" :style="boxStyle">
      <div style="font-family:'DM Serif Display',serif;font-size:26px;color:var(--accent);margin-bottom:4px">
        Abastecimiento Total
      </div>
      <div style="color:var(--text3);font-size:12px;margin-bottom:28px">
        Sistema de cotización — Iniciar sesión
      </div>

      <form @submit.prevent="handleSubmit">
        <div style="margin-bottom:14px">
          <label :style="lblStyle">Correo electrónico</label>
          <input v-model="form.email" type="email" required placeholder="nombre@abastecimientototal.cl" :style="inputStyle" />
        </div>
        <div style="margin-bottom:20px">
          <label :style="lblStyle">Contraseña</label>
          <input v-model="form.password" type="password" required placeholder="••••••••" :style="inputStyle" />
        </div>
        <button type="submit" :disabled="auth.loading" :style="submitStyle">
          {{ auth.loading ? 'Ingresando…' : 'Ingresar al sistema' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const form = reactive({ email: '', password: '' })

async function handleSubmit() {
  try {
    await auth.login(form.email, form.password)
    router.push('/')
  } catch {
    toast.error('Email o contraseña incorrectos')
  }
}

// Styles
const wrapStyle  = { minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }
const gridStyle  = { position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)', backgroundSize:'48px 48px', opacity:.35, pointerEvents:'none' }
const haloStyle  = { position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }
const boxStyle   = { position:'relative', zIndex:2, width:'380px', maxWidth:'calc(100vw - 32px)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'40px 36px' }
const lblStyle   = { display:'block', fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600, marginBottom:'5px' }
const inputStyle = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 12px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', outline:'none', boxSizing:'border-box' }
const submitStyle = { width:'100%', background:'var(--accent)', color:'#0f0e0c', border:'none', borderRadius:'6px', padding:'11px', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', fontWeight:600, cursor:'pointer' }
</script>
