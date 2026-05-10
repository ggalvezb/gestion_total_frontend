<template>
  <div style="min-height:100vh;display:flex;flex-direction:column">
    <!-- Topbar -->
    <header :style="topbarStyle">
      <div style="display:flex;align-items:center;gap:20px">
        <button @click="router.push('/')" style="background:none;border:none;cursor:pointer">
          <span style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--accent)">Abastecimiento Total</span>
          <span v-if="!isMobile" style="color:var(--text3);font-style:italic;font-size:12px;margin-left:8px">cotizador</span>
        </button>
        <!-- Desktop nav -->
        <nav v-if="!isMobile" style="display:flex;gap:2px">
          <button
            v-for="link in navLinks" :key="link.path"
            @click="router.push(link.path)"
            :style="navBtnStyle(link.path)"
          >{{ link.label }}</button>
        </nav>
      </div>

      <div style="display:flex;align-items:center;gap:12px">
        <span v-if="!isMobile" style="font-size:12px;color:var(--text3)">{{ auth.user?.nombre }}</span>
        <div :style="avatarStyle">{{ initials }}</div>
        <button v-if="!isMobile" @click="handleLogout" title="Cerrar sesión" :style="iconBtnStyle">
          <LogOut :size="13" />
        </button>
        <!-- Hamburger -->
        <button v-if="isMobile" @click="menuOpen = !menuOpen" :style="iconBtnStyle">
          <Menu v-if="!menuOpen" :size="16" />
          <X v-else :size="16" />
        </button>
      </div>
    </header>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="isMobile && menuOpen" style="background:var(--surface);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;flex-direction:column;gap:4px;z-index:40;position:relative">
        <button
          v-for="link in navLinks" :key="link.path"
          @click="router.push(link.path); menuOpen = false"
          :style="mobileNavBtnStyle(link.path)"
        >{{ link.label }}</button>
        <div style="height:1px;background:var(--border);margin:8px 0"/>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0">
          <span style="font-size:13px;color:var(--text2)">{{ auth.user?.nombre }}</span>
          <button @click="handleLogout" :style="{...iconBtnStyle, width:'auto', padding:'6px 12px', gap:'6px', display:'flex', alignItems:'center', fontSize:'12px', color:'var(--text2)'}">
            <LogOut :size="13" /> Cerrar sesión
          </button>
        </div>
      </div>
    </Transition>

    <main style="flex:1">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, Menu, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useBreakpoint } from '@/composables/useBreakpoint'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()
const { isMobile } = useBreakpoint()

const menuOpen = ref(false)

const isAdmin = computed(() => auth.user?.rol === 'admin')

const navLinks = computed(() => [
  { path: '/',                 label: 'Home' },
  { path: '/cotizacion/nueva', label: 'Nueva cotización' },
  { path: '/logistica',        label: 'Logística' },
  ...(isAdmin.value ? [
    { path: '/costos-fijos',   label: 'Costos fijos' },
    { path: '/usuarios',       label: 'Usuarios' },
  ] : []),
])

const initials = computed(() =>
  (auth.user?.nombre || 'AT').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
)

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith('/' + path.split('/')[1])
}

const navBtnStyle = (path) => ({
  background: isActive(path) ? 'var(--accent-dim)' : 'transparent',
  color: isActive(path) ? 'var(--accent)' : 'var(--text2)',
  border: 'none', borderRadius: '6px', padding: '8px 16px',
  fontFamily: "'Instrument Sans', sans-serif", fontSize: '13px',
  cursor: 'pointer', transition: 'all .15s',
})

const mobileNavBtnStyle = (path) => ({
  background: isActive(path) ? 'var(--accent-dim)' : 'transparent',
  color: isActive(path) ? 'var(--accent)' : 'var(--text)',
  border: 'none', borderRadius: '8px', padding: '12px 16px',
  fontFamily: "'Instrument Sans', sans-serif", fontSize: '14px',
  cursor: 'pointer', textAlign: 'left', width: '100%',
})

const topbarStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px', borderBottom: '1px solid var(--border)',
  background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50,
}
const avatarStyle = {
  width: '30px', height: '30px', borderRadius: '50%',
  background: 'var(--accent-dim)', border: '1px solid rgba(201,168,76,.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '11px', color: 'var(--accent)', fontWeight: 600, flexShrink: 0,
}
const iconBtnStyle = {
  background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
  width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--text3)',
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style>
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px) }
</style>
