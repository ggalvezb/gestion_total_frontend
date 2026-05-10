<template>
  <AppShell>
    <div :style="{ padding: isMobile ? '16px' : '28px', maxWidth: isMobile ? 'none' : '800px' }" class="fade-in">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">
        <div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:28px">Costos fijos</h1>
          <p style="color:var(--text2);font-size:13px;margin-top:3px">Costos mensuales que se distribuyen entre cotizaciones</p>
        </div>
        <AppBtn @click="mostrarForm = true" v-if="!mostrarForm">
          <Plus :size="14"/> Nuevo costo
        </AppBtn>
      </div>

      <!-- Formulario nuevo -->
      <div v-if="mostrarForm" style="background:var(--surface);border:1px solid var(--accent);border-radius:10px;padding:20px;margin-bottom:16px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);font-weight:600;margin-bottom:14px">Nuevo costo fijo</div>
        <div :style="{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto', gap:'10px', alignItems:'end' }">
          <div>
            <div :style="lblStyle">Nombre</div>
            <input v-model="form.nombre" placeholder="Ej: Arriendo oficina" :style="inputStyle" @keydown.enter="guardarNuevo" />
          </div>
          <div>
            <div :style="lblStyle">Valor mensual $</div>
            <input v-model.number="form.valor_mensual" type="number" min="0" :style="inputStyle" style="width:160px" @keydown.enter="guardarNuevo" />
          </div>
          <div style="display:flex;gap:8px">
            <AppBtn @click="guardarNuevo" :disabled="creando">{{ creando ? 'Guardando…' : 'Guardar' }}</AppBtn>
            <AppBtn variant="ghost" @click="cancelarForm">Cancelar</AppBtn>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <div v-if="isLoading" style="display:flex;justify-content:center;padding:48px">
          <AppSpinner :size="24"/>
        </div>

        <div v-else-if="!costos.length" style="text-align:center;padding:56px;color:var(--text2)">
          <div style="font-size:32px;margin-bottom:12px;opacity:.3">📊</div>
          <div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--text);margin-bottom:6px">Sin costos fijos</div>
          <div style="font-size:13px">Agrega los costos mensuales de tu operación</div>
        </div>

        <!-- Mobile: cards -->
        <div v-else-if="isMobile" style="display:flex;flex-direction:column">
          <div v-for="c in costos" :key="c._id" style="padding:14px 16px;border-bottom:1px solid var(--border)">
            <template v-if="editId === c._id">
              <div style="display:flex;flex-direction:column;gap:8px">
                <input v-model="editForm.nombre" :style="inputStyle" />
                <input v-model.number="editForm.valor_mensual" type="number" min="0" :style="inputStyle" />
                <div style="display:flex;align-items:center;gap:8px">
                  <input type="checkbox" v-model="editForm.activo" style="width:16px;height:16px;cursor:pointer;accent-color:var(--accent)" />
                  <span style="font-size:12px;color:var(--text2)">Activo</span>
                </div>
                <div style="display:flex;gap:8px">
                  <AppBtn size="sm" @click="guardarEdicion(c._id)" :disabled="actualizando">{{ actualizando ? '…' : 'Guardar' }}</AppBtn>
                  <AppBtn size="sm" variant="ghost" @click="cancelarEdicion">Cancelar</AppBtn>
                </div>
              </div>
            </template>
            <template v-else>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div>
                  <div style="font-size:13px;font-weight:500">{{ c.nombre }}</div>
                  <div style="font-family:'DM Mono',monospace;font-size:13px;margin-top:3px">{{ fmt(c.valor_mensual) }}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span :style="activoBadgeStyle(c.activo)">{{ c.activo ? 'Activo' : 'Inactivo' }}</span>
                  <IconBtn @click="iniciarEdicion(c)" title="Editar"><Pencil :size="12"/></IconBtn>
                  <IconBtn danger @click="eliminar(c._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Desktop: table -->
        <table v-else style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th v-for="h in ['Nombre','Valor mensual','Activo','']" :key="h" :style="thStyle">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in costos" :key="c._id" :style="trStyle(c._id)">

              <!-- Modo edición -->
              <template v-if="editId === c._id">
                <td :style="tdStyle">
                  <input v-model="editForm.nombre" :style="inputStyle" style="margin:0" />
                </td>
                <td :style="tdStyle">
                  <input v-model.number="editForm.valor_mensual" type="number" min="0" :style="inputStyle" style="width:140px;margin:0" />
                </td>
                <td :style="tdStyle">
                  <input type="checkbox" v-model="editForm.activo" style="width:16px;height:16px;cursor:pointer;accent-color:var(--accent)" />
                </td>
                <td :style="tdStyle">
                  <div style="display:flex;gap:6px">
                    <AppBtn size="sm" @click="guardarEdicion(c._id)" :disabled="actualizando">
                      {{ actualizando ? '…' : 'Guardar' }}
                    </AppBtn>
                    <AppBtn size="sm" variant="ghost" @click="cancelarEdicion">Cancelar</AppBtn>
                  </div>
                </td>
              </template>

              <!-- Modo lectura -->
              <template v-else>
                <td :style="tdStyle">
                  <span style="font-size:13px">{{ c.nombre }}</span>
                </td>
                <td :style="tdStyle">
                  <span style="font-family:'DM Mono',monospace;font-size:13px">{{ fmt(c.valor_mensual) }}</span>
                </td>
                <td :style="tdStyle">
                  <span :style="activoBadgeStyle(c.activo)">{{ c.activo ? 'Activo' : 'Inactivo' }}</span>
                </td>
                <td :style="tdStyle">
                  <div style="display:flex;gap:5px">
                    <IconBtn @click="iniciarEdicion(c)" title="Editar"><Pencil :size="12"/></IconBtn>
                    <IconBtn danger @click="eliminar(c._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div v-if="costos.length" style="display:flex;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border);gap:8px;align-items:center">
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);font-weight:600">Total mensual activo</span>
          <span style="font-family:'DM Mono',monospace;font-size:16px;color:var(--accent)">{{ fmt(totalActivo) }}</span>
        </div>
      </div>

    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import AppBtn   from '@/components/ui/AppBtn.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { costoFijoService } from '@/services'
import { fmt } from '@/lib/utils'
import { useToast } from '@/composables/useToast'
import { useBreakpoint } from '@/composables/useBreakpoint'

const qc    = useQueryClient()
const toast = useToast()
const { isMobile } = useBreakpoint()

// ── Queries ────────────────────────────────────────────────
const { data, isLoading } = useQuery({
  queryKey: ['costos-fijos'],
  queryFn:  costoFijoService.listar,
})

const costos = computed(() => data.value || [])
const totalActivo = computed(() => costos.value.filter(c => c.activo).reduce((s, c) => s + c.valor_mensual, 0))

// ── Crear ──────────────────────────────────────────────────
const mostrarForm = ref(false)
const creando     = ref(false)
const form        = ref({ nombre: '', valor_mensual: 0 })

function cancelarForm() {
  mostrarForm.value = false
  form.value = { nombre: '', valor_mensual: 0 }
}

async function guardarNuevo() {
  if (!form.value.nombre.trim()) return
  creando.value = true
  try {
    await costoFijoService.crear({ ...form.value, orden: costos.value.length })
    qc.invalidateQueries({ queryKey: ['costos-fijos'] })
    toast.success('Costo fijo creado')
    cancelarForm()
  } catch {}
  creando.value = false
}

// ── Editar ─────────────────────────────────────────────────
const editId      = ref(null)
const editForm    = ref({})
const actualizando = ref(false)

function iniciarEdicion(c) {
  editId.value   = c._id
  editForm.value = { nombre: c.nombre, valor_mensual: c.valor_mensual, activo: c.activo }
}

function cancelarEdicion() {
  editId.value = null
}

async function guardarEdicion(id) {
  actualizando.value = true
  try {
    await costoFijoService.actualizar(id, editForm.value)
    qc.invalidateQueries({ queryKey: ['costos-fijos'] })
    toast.success('Costo fijo actualizado')
    editId.value = null
  } catch {}
  actualizando.value = false
}

// ── Eliminar ───────────────────────────────────────────────
async function eliminar(id) {
  if (!confirm('¿Eliminar este costo fijo?')) return
  try {
    await costoFijoService.eliminar(id)
    qc.invalidateQueries({ queryKey: ['costos-fijos'] })
    toast.success('Costo fijo eliminado')
  } catch {}
}

// ── Estilos ────────────────────────────────────────────────
const IconBtn = defineComponent({
  props: ['danger', 'title'],
  setup: (p, { slots, attrs }) => () => h('button', {
    ...attrs,
    title: p.title,
    style: {
      background: 'transparent',
      border: `1px solid ${p.danger ? 'rgba(239,68,68,.3)' : 'var(--border)'}`,
      borderRadius: '5px', width: '28px', height: '28px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      color: p.danger ? 'rgb(239,68,68)' : 'var(--text3)',
    },
  }, slots.default?.()),
})

const lblStyle = { fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 600, marginBottom: '5px' }
const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px', color: 'var(--text)', fontFamily: "'Instrument Sans',sans-serif", fontSize: '13px', outline: 'none' }
const thStyle = { fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid var(--border)' }
const trStyle = (id) => ({ background: editId.value === id ? 'rgba(201,168,76,.04)' : 'transparent' })

const activoBadgeStyle = (activo) => ({
  display: 'inline-block',
  padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
  background: activo ? 'rgba(34,197,94,.1)' : 'var(--surface2)',
  color: activo ? 'rgb(34,197,94)' : 'var(--text3)',
  border: `1px solid ${activo ? 'rgba(34,197,94,.25)' : 'var(--border)'}`,
})
</script>
