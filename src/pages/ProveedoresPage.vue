<template>
  <AppShell>
    <div :style="{ padding: isMobile ? '16px' : '28px' }" class="fade-in">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">
        <div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:28px">Proveedores</h1>
          <p style="color:var(--text2);font-size:13px;margin-top:3px">Agenda de proveedores</p>
        </div>
        <AppBtn @click="abrirNuevo"><Plus :size="14"/> Nuevo proveedor</AppBtn>
      </div>

      <!-- Search -->
      <div style="margin-bottom:16px">
        <input
          v-model="busqueda"
          placeholder="Buscar por nombre, rut o rubro…"
          :style="searchStyle"
        />
      </div>

      <!-- Content -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div v-if="isLoading" style="display:flex;justify-content:center;padding:48px">
          <AppSpinner :size="24"/>
        </div>
        <div v-else-if="!filtrados.length" style="text-align:center;padding:56px;color:var(--text2)">
          <div style="font-size:32px;margin-bottom:12px;opacity:.3">🏢</div>
          <div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--text);margin-bottom:6px">
            {{ busqueda ? 'Sin resultados' : 'Sin proveedores' }}
          </div>
          <AppBtn v-if="!busqueda" @click="abrirNuevo"><Plus :size="14"/> Nuevo proveedor</AppBtn>
        </div>

        <!-- Mobile: cards -->
        <div v-else-if="isMobile" style="display:flex;flex-direction:column;gap:10px;padding:12px">
          <div
            v-for="p in filtrados" :key="p._id"
            style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;cursor:pointer"
            @click="abrirDetalle(p)"
          >
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
              <div>
                <div style="font-weight:500;font-size:14px">{{ p.nombre }}</div>
                <div v-if="p.rut" style="font-size:11px;color:var(--text3);margin-top:2px">{{ p.rut }}</div>
              </div>
              <div style="display:flex;gap:5px" @click.stop>
                <IconBtn @click="abrirEditar(p)" title="Editar"><Pencil :size="12"/></IconBtn>
                <IconBtn danger @click="confirmarEliminar(p._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <span v-if="p.rubro" :style="rubroStyle">{{ p.rubro }}</span>
              <span :style="activoStyle(p.activo)">{{ p.activo ? 'Activo' : 'Inactivo' }}</span>
            </div>
            <div v-if="p.contacto || p.telefono" style="font-size:12px;color:var(--text2)">
              {{ [p.contacto, p.telefono].filter(Boolean).join(' · ') }}
            </div>
          </div>
        </div>

        <!-- Desktop: table -->
        <table v-else style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th v-for="h in ['Proveedor','RUT','Rubro','Contacto','Teléfono','Email','Estado','']" :key="h" :style="thStyle">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in filtrados" :key="p._id"
              style="cursor:pointer;transition:background .1s"
              @click="abrirDetalle(p)"
              @mouseenter="e=>e.currentTarget.style.background='rgba(255,255,255,.02)'"
              @mouseleave="e=>e.currentTarget.style.background='transparent'"
            >
              <td :style="tdStyle">
                <div style="font-weight:500">{{ p.nombre }}</div>
                <div v-if="p.direccion" style="font-size:11px;color:var(--text3);margin-top:1px">{{ p.direccion }}</div>
              </td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ p.rut || '—' }}</td>
              <td :style="tdStyle">
                <span v-if="p.rubro" :style="rubroStyle">{{ p.rubro }}</span>
                <span v-else style="color:var(--text3)">—</span>
              </td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ p.contacto || '—' }}</td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ p.telefono || '—' }}</td>
              <td :style="tdStyle" style="color:var(--text2);font-size:12px">{{ p.email || '—' }}</td>
              <td :style="tdStyle"><span :style="activoStyle(p.activo)">{{ p.activo ? 'Activo' : 'Inactivo' }}</span></td>
              <td :style="tdStyle" @click.stop>
                <div style="display:flex;gap:5px">
                  <IconBtn @click="abrirEditar(p)" title="Editar"><Pencil :size="12"/></IconBtn>
                  <IconBtn danger @click="confirmarEliminar(p._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Count -->
      <div v-if="filtrados.length" style="margin-top:10px;font-size:12px;color:var(--text3);text-align:right">
        {{ filtrados.length }} proveedor{{ filtrados.length !== 1 ? 'es' : '' }}
        <template v-if="busqueda"> encontrado{{ filtrados.length !== 1 ? 's' : '' }}</template>
      </div>
    </div>

    <!-- Form modal (create / edit) -->
    <AppModal :open="showModal" :title="editId ? 'Editar proveedor' : 'Nuevo proveedor'" @close="cerrarModal">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="grid-column:1/-1">
            <ModalLabel>Nombre *</ModalLabel>
            <ModalInput v-model="form.nombre" placeholder="Razón social o nombre comercial"/>
          </div>
          <div>
            <ModalLabel>RUT</ModalLabel>
            <ModalInput v-model="form.rut" placeholder="76.123.456-7"/>
          </div>
          <div>
            <ModalLabel>Rubro</ModalLabel>
            <ModalInput v-model="form.rubro" placeholder="Ej: Materiales de oficina"/>
          </div>
          <div>
            <ModalLabel>Contacto</ModalLabel>
            <ModalInput v-model="form.contacto" placeholder="Nombre del contacto"/>
          </div>
          <div>
            <ModalLabel>Teléfono</ModalLabel>
            <ModalInput v-model="form.telefono" placeholder="+56 9 1234 5678"/>
          </div>
          <div>
            <ModalLabel>Email</ModalLabel>
            <ModalInput v-model="form.email" type="email" placeholder="contacto@proveedor.cl"/>
          </div>
          <div>
            <ModalLabel>Dirección</ModalLabel>
            <ModalInput v-model="form.direccion" placeholder="Dirección comercial"/>
          </div>
        </div>
        <div>
          <ModalLabel>Notas</ModalLabel>
          <textarea
            v-model="form.notas"
            placeholder="Observaciones, condiciones de pago, etc."
            :style="textareaStyle"
            rows="3"
          />
        </div>
        <div v-if="editId" style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px">
          <ModalLabel style="margin:0">Proveedor activo</ModalLabel>
          <button @click="form.activo = !form.activo" :style="toggleStyle(form.activo)">
            <div :style="toggleKnob(form.activo)"/>
          </button>
          <span style="font-size:12px;color:var(--text2)">{{ form.activo ? 'Activo' : 'Inactivo' }}</span>
        </div>
        <div style="height:1px;background:var(--border);margin:4px 0"/>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <AppBtn variant="ghost" size="sm" @click="cerrarModal">Cancelar</AppBtn>
          <AppBtn size="sm" @click="guardar" :disabled="saving">{{ saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear proveedor' }}</AppBtn>
        </div>
      </div>
    </AppModal>

    <!-- Detail modal (view) -->
    <AppModal :open="showDetalle" :title="detalle?.nombre || ''" @close="showDetalle = false">
      <div v-if="detalle" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <DetalleField label="RUT" :value="detalle.rut"/>
          <DetalleField label="Rubro" :value="detalle.rubro"/>
          <DetalleField label="Contacto" :value="detalle.contacto"/>
          <DetalleField label="Teléfono" :value="detalle.telefono"/>
          <DetalleField label="Email" :value="detalle.email"/>
          <DetalleField label="Dirección" :value="detalle.direccion"/>
        </div>
        <div v-if="detalle.notas">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);font-weight:600;margin-bottom:6px">Notas</div>
          <p style="font-size:13px;color:var(--text2);white-space:pre-wrap;line-height:1.5;margin:0">{{ detalle.notas }}</p>
        </div>
        <div style="height:1px;background:var(--border)"/>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <AppBtn variant="ghost" size="sm" @click="showDetalle = false">Cerrar</AppBtn>
          <AppBtn size="sm" @click="showDetalle = false; abrirEditar(detalle)"><Pencil :size="12"/> Editar</AppBtn>
        </div>
      </div>
    </AppModal>
  </AppShell>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import AppShell  from '@/components/layout/AppShell.vue'
import AppBtn    from '@/components/ui/AppBtn.vue'
import AppModal  from '@/components/ui/AppModal.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { proveedorService } from '@/services'
import { useToast } from '@/composables/useToast'
import { useBreakpoint } from '@/composables/useBreakpoint'

const qc    = useQueryClient()
const toast = useToast()
const { isMobile } = useBreakpoint()

const showModal  = ref(false)
const showDetalle = ref(false)
const saving     = ref(false)
const editId     = ref(null)
const detalle    = ref(null)
const busqueda   = ref('')

const emptyForm = () => ({ nombre:'', rut:'', rubro:'', contacto:'', email:'', telefono:'', direccion:'', notas:'', activo:true })
const form = reactive(emptyForm())

const { data: proveedores = ref([]), isLoading } = useQuery({
  queryKey: ['proveedores'],
  queryFn:  proveedorService.listar,
})

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return proveedores.value
  return proveedores.value.filter(p =>
    (p.nombre || '').toLowerCase().includes(q) ||
    (p.rut    || '').toLowerCase().includes(q) ||
    (p.rubro  || '').toLowerCase().includes(q) ||
    (p.contacto || '').toLowerCase().includes(q)
  )
})

function abrirNuevo() {
  editId.value = null
  Object.assign(form, emptyForm())
  showModal.value = true
}

function abrirEditar(p) {
  editId.value = p._id
  Object.assign(form, {
    nombre: p.nombre || '', rut: p.rut || '', rubro: p.rubro || '',
    contacto: p.contacto || '', email: p.email || '', telefono: p.telefono || '',
    direccion: p.direccion || '', notas: p.notas || '', activo: p.activo ?? true,
  })
  showModal.value = true
}

function abrirDetalle(p) {
  detalle.value = p
  showDetalle.value = true
}

function cerrarModal() {
  showModal.value = false
  editId.value = null
}

async function guardar() {
  if (!form.nombre.trim()) return toast.error('El nombre es obligatorio')
  saving.value = true
  try {
    const payload = {
      nombre: form.nombre.trim(),
      rut: form.rut || null,
      rubro: form.rubro || null,
      contacto: form.contacto || null,
      email: form.email || null,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      notas: form.notas || null,
    }
    if (editId.value) {
      payload.activo = form.activo
      await proveedorService.actualizar(editId.value, payload)
      toast.success('Proveedor actualizado')
    } else {
      await proveedorService.crear(payload)
      toast.success('Proveedor creado')
    }
    qc.invalidateQueries({ queryKey: ['proveedores'] })
    cerrarModal()
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Error al guardar')
  }
  saving.value = false
}

async function confirmarEliminar(id) {
  if (!confirm('¿Eliminar este proveedor?')) return
  try {
    await proveedorService.eliminar(id)
    qc.invalidateQueries({ queryKey: ['proveedores'] })
    toast.success('Proveedor eliminado')
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Error al eliminar')
  }
}

// Styles
const thStyle = { fontSize:'10px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600, padding:'0 14px 10px', textAlign:'left', borderBottom:'1px solid var(--border)' }
const tdStyle = { padding:'13px 14px', borderBottom:'1px solid var(--border)', fontSize:'13px' }
const rubroStyle = { display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border)' }
const searchStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'9px 14px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', outline:'none', boxSizing:'border-box' }
const textareaStyle = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 12px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box' }

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
const IconBtn    = defineComponent({ props:['title','danger','disabled'],emits:['click'], setup:(p,{slots,emit})=>()=>h('button',{title:p.title,disabled:p.disabled,onClick:()=>!p.disabled&&emit('click'),style:{background:'transparent',border:'1px solid var(--border)',borderRadius:'6px',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',cursor:p.disabled?'not-allowed':'pointer',color:p.danger?'var(--danger)':'var(--text3)',opacity:p.disabled?.4:1,transition:'all .15s'}},slots.default?.()) })
const DetalleField = defineComponent({ props:['label','value'], setup:(p)=>()=>p.value ? h('div',{},[h('div',{style:{fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',fontWeight:600,marginBottom:'3px'}},p.label),h('div',{style:{fontSize:'13px',color:'var(--text)'}},p.value)]) : null })
</script>
