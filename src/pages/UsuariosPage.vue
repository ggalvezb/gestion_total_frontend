<template>
  <AppShell>
    <div :style="{ padding: isMobile ? '16px' : '28px' }" class="fade-in">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">
        <div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:28px">Usuarios</h1>
          <p style="color:var(--text2);font-size:13px;margin-top:3px">Gestión de accesos al sistema</p>
        </div>
        <AppBtn @click="abrirNuevo"><Plus :size="14"/> Nuevo usuario</AppBtn>
      </div>

      <!-- Table -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div v-if="isLoading" style="display:flex;justify-content:center;padding:48px">
          <AppSpinner :size="24"/>
        </div>
        <div v-else-if="!usuarios.length" style="text-align:center;padding:56px;color:var(--text2)">
          <div style="font-size:32px;margin-bottom:12px;opacity:.3">👤</div>
          <div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--text);margin-bottom:6px">Sin usuarios</div>
          <AppBtn @click="abrirNuevo"><Plus :size="14"/> Nuevo usuario</AppBtn>
        </div>
        <!-- Mobile: cards -->
        <div v-else-if="isMobile" style="display:flex;flex-direction:column;gap:10px;padding:12px">
          <div v-for="u in usuarios" :key="u._id" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px 16px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:10px">
                <div :style="avatarStyle(u)">{{ iniciales(u.nombre) }}</div>
                <div>
                  <div style="font-weight:500;font-size:14px">{{ u.nombre }}</div>
                  <div style="font-size:11px;color:var(--text3);margin-top:1px">{{ u.email }}</div>
                </div>
              </div>
              <div style="display:flex;gap:5px">
                <IconBtn @click="abrirEditar(u)" title="Editar"><Pencil :size="12"/></IconBtn>
                <IconBtn danger @click="confirmarEliminar(u._id)" title="Eliminar" :disabled="u._id === authStore.user?._id"><Trash2 :size="12"/></IconBtn>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span :style="rolStyle(u.rol)">{{ u.rol }}</span>
              <span :style="activoStyle(u.activo)">{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
              <span style="font-size:11px;color:var(--text3);align-self:center">{{ u.telefono }}</span>
            </div>
          </div>
        </div>

        <!-- Desktop: table -->
        <table v-else style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th v-for="h in ['Nombre','Email','Teléfono','Rol','Estado','']" :key="h" :style="thStyle">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in usuarios" :key="u._id"
              style="transition:background .1s"
              @mouseenter="e=>e.currentTarget.style.background='rgba(255,255,255,.02)'"
              @mouseleave="e=>e.currentTarget.style.background='transparent'"
            >
              <td :style="tdStyle">
                <div style="display:flex;align-items:center;gap:10px">
                  <div :style="avatarStyle(u)">{{ iniciales(u.nombre) }}</div>
                  <span style="font-weight:500">{{ u.nombre }}</span>
                </div>
              </td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ u.email }}</td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ u.telefono }}</td>
              <td :style="tdStyle"><span :style="rolStyle(u.rol)">{{ u.rol }}</span></td>
              <td :style="tdStyle"><span :style="activoStyle(u.activo)">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td :style="tdStyle">
                <div style="display:flex;gap:5px">
                  <IconBtn @click="abrirEditar(u)" title="Editar"><Pencil :size="12"/></IconBtn>
                  <IconBtn danger @click="confirmarEliminar(u._id)" title="Eliminar" :disabled="u._id === authStore.user?._id"><Trash2 :size="12"/></IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :open="showModal" :title="editId ? 'Editar usuario' : 'Nuevo usuario'" @close="cerrarModal">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <ModalLabel>Nombre</ModalLabel>
            <ModalInput v-model="form.nombre" placeholder="Nombre completo"/>
          </div>
          <div>
            <ModalLabel>Email</ModalLabel>
            <ModalInput v-model="form.email" type="email" placeholder="correo@ejemplo.com"/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <ModalLabel>Teléfono</ModalLabel>
            <ModalInput v-model="form.telefono" placeholder="+56 9 1234 5678"/>
          </div>
          <div>
            <ModalLabel>Rol</ModalLabel>
            <select v-model="form.rol" :style="selectStyle">
              <option value="ejecutivo">Ejecutivo</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div v-if="editId">
          <ModalLabel>Nueva contraseña (dejar vacío para no cambiar)</ModalLabel>
          <ModalInput v-model="form.password" type="password" placeholder="••••••••"/>
        </div>
        <div v-else>
          <ModalLabel>Contraseña</ModalLabel>
          <ModalInput v-model="form.password" type="password" placeholder="••••••••"/>
        </div>
        <div v-if="editId" style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px">
          <ModalLabel style="margin:0">Usuario activo</ModalLabel>
          <button @click="form.activo = !form.activo" :style="toggleStyle(form.activo)">
            <div :style="toggleKnob(form.activo)"/>
          </button>
          <span style="font-size:12px;color:var(--text2)">{{ form.activo ? 'Activo' : 'Inactivo' }}</span>
        </div>
        <div style="height:1px;background:var(--border);margin:4px 0"/>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <AppBtn variant="ghost" size="sm" @click="cerrarModal">Cancelar</AppBtn>
          <AppBtn size="sm" @click="guardar" :disabled="saving">{{ saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear usuario' }}</AppBtn>
        </div>
      </div>
    </AppModal>
  </AppShell>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import AppShell  from '@/components/layout/AppShell.vue'
import AppBtn    from '@/components/ui/AppBtn.vue'
import AppModal  from '@/components/ui/AppModal.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { usuarioService } from '@/services'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useBreakpoint } from '@/composables/useBreakpoint'

const qc        = useQueryClient()
const toast     = useToast()
const authStore = useAuthStore()
const { isMobile } = useBreakpoint()

const showModal = ref(false)
const saving    = ref(false)
const editId    = ref(null)
const form      = reactive({ nombre:'', email:'', telefono:'', rol:'ejecutivo', password:'', activo:true })

const { data: usuarios = ref([]), isLoading } = useQuery({
  queryKey: ['usuarios'],
  queryFn:  usuarioService.listar,
})

function abrirNuevo() {
  editId.value = null
  Object.assign(form, { nombre:'', email:'', telefono:'', rol:'ejecutivo', password:'', activo:true })
  showModal.value = true
}

function abrirEditar(u) {
  editId.value = u._id
  Object.assign(form, { nombre: u.nombre, email: u.email, telefono: u.telefono, rol: u.rol, password: '', activo: u.activo })
  showModal.value = true
}

function cerrarModal() {
  showModal.value = false
  editId.value = null
}

async function guardar() {
  if (!form.nombre || !form.email) return toast.error('Nombre y email son obligatorios')
  if (!editId.value && !form.password) return toast.error('La contraseña es obligatoria')
  saving.value = true
  try {
    if (editId.value) {
      const payload = { nombre: form.nombre, email: form.email, telefono: form.telefono, rol: form.rol, activo: form.activo }
      if (form.password) payload.password = form.password
      await usuarioService.actualizar(editId.value, payload)
      toast.success('Usuario actualizado')
    } else {
      await usuarioService.crear({ nombre: form.nombre, email: form.email, telefono: form.telefono, rol: form.rol, password: form.password })
      toast.success('Usuario creado')
    }
    qc.invalidateQueries({ queryKey: ['usuarios'] })
    cerrarModal()
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Error al guardar')
  }
  saving.value = false
}

async function confirmarEliminar(id) {
  if (id === authStore.user?._id) return
  if (!confirm('¿Eliminar este usuario?')) return
  try {
    await usuarioService.eliminar(id)
    qc.invalidateQueries({ queryKey: ['usuarios'] })
    toast.success('Usuario eliminado')
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Error al eliminar')
  }
}

const iniciales = (nombre) => (nombre || 'U').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()

// Styles
const thStyle  = { fontSize:'10px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600, padding:'0 14px 10px', textAlign:'left', borderBottom:'1px solid var(--border)' }
const tdStyle  = { padding:'13px 14px', borderBottom:'1px solid var(--border)', fontSize:'13px' }
const selectStyle = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 12px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', outline:'none' }

const avatarStyle = (u) => ({
  width:'30px', height:'30px', borderRadius:'50%', flexShrink:0,
  background: u.activo ? 'var(--accent-dim)' : 'var(--surface3)',
  border: `1px solid ${u.activo ? 'rgba(201,168,76,.3)' : 'var(--border2)'}`,
  display:'flex', alignItems:'center', justifyContent:'center',
  fontSize:'11px', color: u.activo ? 'var(--accent)' : 'var(--text3)', fontWeight:600,
})

const rolStyle = (rol) => ({
  display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:'20px',
  fontSize:'11px', fontWeight:600, letterSpacing:'.04em',
  background: rol === 'admin' ? 'var(--info-dim)' : 'var(--surface2)',
  color: rol === 'admin' ? '#7aafd4' : 'var(--text2)',
  border: rol === 'admin' ? '1px solid rgba(90,143,196,.3)' : '1px solid var(--border)',
})

const activoStyle = (activo) => ({
  display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:'20px',
  fontSize:'11px', fontWeight:600,
  background: activo ? 'rgba(106,170,122,.1)' : 'var(--surface3)',
  color: activo ? '#4e9660' : 'var(--text3)',
  border: activo ? '1px solid rgba(106,170,122,.2)' : '1px solid var(--border2)',
})

const toggleStyle = (on) => ({
  width:'36px', height:'20px', borderRadius:'10px', border:'none', cursor:'pointer',
  background: on ? 'var(--success)' : 'var(--surface3)', position:'relative',
  transition:'background .2s', padding:0, flexShrink:0,
})
const toggleKnob = (on) => ({
  position:'absolute', top:'3px', left: on ? '19px' : '3px',
  width:'14px', height:'14px', borderRadius:'50%', background:'white',
  transition:'left .2s',
})

// Local components
const ModalLabel = defineComponent({ setup: (_,{slots})=>()=>h('label',{style:{display:'block',fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',fontWeight:600,marginBottom:'5px'}},slots.default?.()) })
const ModalInput = defineComponent({ props:['modelValue','type','placeholder'],emits:['update:modelValue'], setup:(p,{emit})=>()=>h('input',{value:p.modelValue,type:p.type||'text',placeholder:p.placeholder,onInput:e=>emit('update:modelValue',e.target.value),style:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'9px 12px',color:'var(--text)',fontFamily:"'Instrument Sans',sans-serif",fontSize:'13px',outline:'none',boxSizing:'border-box'}}) })
const IconBtn   = defineComponent({ props:['title','danger','disabled'],emits:['click'], setup:(p,{slots,emit})=>()=>h('button',{title:p.title,disabled:p.disabled,onClick:()=>!p.disabled&&emit('click'),style:{background:'transparent',border:`1px solid ${p.danger?'var(--border)':'var(--border)'}`,borderRadius:'6px',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',cursor:p.disabled?'not-allowed':'pointer',color:p.danger?'var(--danger)':'var(--text3)',opacity:p.disabled?.4:1,transition:'all .15s'}},slots.default?.()) })
</script>
