<template>
  <AppShell>
    <div :style="{ padding: isMobile ? '16px' : '28px' }" class="fade-in">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">
        <div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:28px">Cotizaciones</h1>
          <p style="color:var(--text2);font-size:13px;margin-top:3px">Registro completo</p>
        </div>
        <AppBtn @click="router.push('/cotizacion/nueva')">
          <Plus :size="14" /> {{ isMobile ? 'Nueva' : 'Nueva cotización' }}
        </AppBtn>
      </div>

      <!-- Stats -->
      <div :style="{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:'10px', marginBottom:'20px' }">
        <div v-for="s in stats" :key="s.label" style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 16px">
          <div style="font-family:'DM Mono',monospace;font-size:20px;margin-bottom:3px" :style="{color:s.color}">{{ s.value }}</div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">{{ s.label }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div :style="{ marginBottom:'14px' }">
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none">
          <button
            v-for="f in FILTROS" :key="String(f.key)"
            @click="estadoFiltro = f.key"
            :style="filterStyle(f.key)"
          >{{ f.label }}</button>
        </div>
        <div :style="{ display:'flex', gap:'8px', marginTop:'8px', flexWrap: isMobile ? 'wrap' : 'nowrap' }">
          <select v-model="ejecutivoFiltro" :style="{ ...selectStyle, flex: isMobile ? '1' : 'none' }">
            <option :value="null">Todos los ejecutivos</option>
            <option v-for="u in (usuarios || [])" :key="u._id" :value="u._id">{{ u.nombre }}</option>
          </select>
          <div :style="{ position:'relative', flex: isMobile ? '1' : 'none' }">
            <Search :size="13" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text3)" />
            <input v-model="search" placeholder="Buscar…" :style="{ ...searchStyle, width: isMobile ? '100%' : '220px', boxSizing:'border-box' }" />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" style="display:flex;justify-content:center;padding:48px">
        <AppSpinner :size="24" />
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" style="text-align:center;padding:48px;color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-size:32px;margin-bottom:12px;opacity:.3">📋</div>
        <div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--text);margin-bottom:6px">Sin cotizaciones</div>
        <div style="font-size:13px;margin-bottom:20px">{{ search ? 'No se encontraron resultados' : 'Crea tu primera cotización' }}</div>
        <AppBtn v-if="!search" @click="router.push('/cotizacion/nueva')"><Plus :size="14"/> Nueva cotización</AppBtn>
      </div>

      <!-- Mobile: cards -->
      <div v-else-if="isMobile" style="display:flex;flex-direction:column;gap:10px">
        <div
          v-for="cot in filtered" :key="cot._id"
          style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 16px"
          @click="router.push(`/cotizacion/${cot._id}`)"
        >
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--accent)">{{ cot.numero }}</span>
            <AppBadge :estado="ESTADOS[cot.estado]?.color" :label="ESTADOS[cot.estado]?.label" />
          </div>
          <div style="font-weight:500;font-size:14px;margin-bottom:2px">{{ cot.cliente?.nombre }}</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:10px">{{ cot.cliente?.rut }}</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-family:'DM Mono',monospace;font-size:15px">{{ fmt(cot.calculos?.precio_venta_total) }}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">{{ fmtFecha(cot.creado_en) }} · {{ usuarioMap[cot.ejecutivo_id] || '—' }}</div>
            </div>
            <div style="display:flex;gap:6px" @click.stop>
              <IconBtn v-if="['en_compra','comprada','despachado'].includes(cot.estado)" @click="router.push(`/logistica/${cot._id}`)" title="Logística">📦</IconBtn>
              <IconBtn danger @click="confirmarEliminar(cot._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: table -->
      <div v-else style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th v-for="h in headers" :key="h" :style="thStyle">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cot in filtered" :key="cot._id"
              style="cursor:pointer;transition:background .1s"
              @mouseenter="e => e.currentTarget.style.background='rgba(255,255,255,.02)'"
              @mouseleave="e => e.currentTarget.style.background='transparent'"
            >
              <td :style="tdStyle">
                <div style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent)">{{ cot.numero }}</div>
              </td>
              <td :style="tdStyle">
                <div style="font-weight:500">{{ cot.cliente?.nombre }}</div>
                <div style="font-size:11px;color:var(--text3);margin-top:1px">{{ cot.cliente?.rut }}</div>
              </td>
              <td :style="tdStyle" style="font-size:12px;color:var(--text2)">{{ usuarioMap[cot.ejecutivo_id] || '—' }}</td>
              <td :style="tdStyle" style="font-size:12px;color:var(--text2)">{{ fmtFecha(cot.creado_en) }}</td>
              <td :style="tdStyle" style="font-family:'DM Mono',monospace;font-size:13px">{{ fmt(cot.calculos?.precio_venta_total) }}</td>
              <td :style="tdStyle">
                <AppBadge :estado="ESTADOS[cot.estado]?.color" :label="ESTADOS[cot.estado]?.label" />
              </td>
              <td :style="tdStyle">
                <div style="display:flex;gap:5px">
                  <IconBtn @click="router.push(`/cotizacion/${cot._id}`)" title="Ver / Editar"><ArrowUpRight :size="13"/></IconBtn>
                  <IconBtn v-if="['en_compra','comprada','despachado'].includes(cot.estado)" @click="router.push(`/logistica/${cot._id}`)" title="Logística">📦</IconBtn>
                  <IconBtn danger @click="confirmarEliminar(cot._id)" title="Eliminar"><Trash2 :size="12"/></IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Plus, Search, ArrowUpRight, Trash2 } from 'lucide-vue-next'
import { defineComponent, h } from 'vue'
import AppShell   from '@/components/layout/AppShell.vue'
import AppBtn     from '@/components/ui/AppBtn.vue'
import AppBadge   from '@/components/ui/AppBadge.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { cotizacionService, usuarioService } from '@/services'
import { fmt, fmtFecha, ESTADOS } from '@/lib/utils'
import { useToast } from '@/composables/useToast'
import { useBreakpoint } from '@/composables/useBreakpoint'

const router = useRouter()
const qc     = useQueryClient()
const toast  = useToast()
const { isMobile } = useBreakpoint()

const estadoFiltro    = ref(null)
const ejecutivoFiltro = ref(null)
const search          = ref('')

const FILTROS = [
  { key: null,         label: 'Todas' },
  { key: 'borrador',   label: 'Borradores' },
  { key: 'enviada',    label: 'Enviadas' },
  { key: 'aprobada',   label: 'Aprobadas' },
  { key: 'en_compra',  label: 'En compra' },
  { key: 'comprada',   label: 'Completadas' },
  { key: 'despachado', label: 'Despachadas' },
  { key: 'rechazada',  label: 'Rechazadas' },
]

const { data: usuarios } = useQuery({ queryKey: ['usuarios'], queryFn: usuarioService.listar })

const usuarioMap = computed(() => {
  const map = {}
  for (const u of (usuarios.value || [])) map[u._id] = u.nombre
  return map
})

const { data: cotizaciones, isLoading } = useQuery({
  queryKey: computed(() => ['cotizaciones', estadoFiltro.value]),
  queryFn:  () => cotizacionService.listar(estadoFiltro.value ? { estado: estadoFiltro.value } : {}),
})

const deleteMutation = useMutation({
  mutationFn: cotizacionService.eliminar,
  onSuccess: () => { qc.invalidateQueries({ queryKey: ['cotizaciones'] }); toast.success('Cotización eliminada') },
})

const filtered = computed(() => {
  let list = cotizaciones.value || []
  if (ejecutivoFiltro.value) list = list.filter(c => c.ejecutivo_id === ejecutivoFiltro.value)
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(c => c.numero?.toLowerCase().includes(q) || c.cliente?.nombre?.toLowerCase().includes(q))
})

const stats = computed(() => {
  const list = cotizaciones.value || []
  return [
    { label: 'Total cotizaciones', value: list.length, color: 'var(--text)' },
    { label: 'En proceso', value: list.filter(c => ['enviada','aprobada','en_compra'].includes(c.estado)).length, color: 'var(--accent)' },
    { label: 'Facturado', value: fmt(list.filter(c=>c.estado==='comprada').reduce((s,c)=>s+(c.calculos?.precio_venta_total||0),0)), color: 'var(--success)' },
    { label: 'Utilidad',  value: fmt(list.filter(c=>c.estado==='comprada').reduce((s,c)=>s+(c.calculos?.utilidad_monto||0),0)), color: 'var(--info)' },
  ]
})

function confirmarEliminar(id) {
  if (confirm('¿Eliminar esta cotización?')) deleteMutation.mutate(id)
}

const filterStyle = (key) => ({
  background: estadoFiltro.value === key ? 'var(--accent-dim)' : 'transparent',
  border: `1px solid ${estadoFiltro.value === key ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
  color: estadoFiltro.value === key ? 'var(--accent)' : 'var(--text2)',
  borderRadius: '20px', fontSize: '12px', padding: '5px 14px', cursor: 'pointer',
  fontFamily: "'Instrument Sans',sans-serif", transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
})
const searchStyle = { paddingLeft:'30px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'7px 12px 7px 30px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'12px', outline:'none' }
const selectStyle = { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'6px 12px', color:'var(--text2)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'12px', outline:'none', cursor:'pointer' }
const headers = ['N° Cotización','Cliente','Ejecutivo','Fecha','Monto','Estado','']
const thStyle = { fontSize:'10px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600, padding:'0 14px 10px', textAlign:'left', borderBottom:'1px solid var(--border)' }
const tdStyle = { padding:'13px 14px', borderBottom:'1px solid var(--border)', fontSize:'13px' }

const IconBtn = defineComponent({
  props: { title: String, danger: Boolean },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('button', {
      title: props.title,
      onClick: () => emit('click'),
      style: { background:'transparent', border:'1px solid var(--border)', borderRadius:'6px', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: props.danger ? 'var(--danger)' : 'var(--text3)', transition:'all .15s' },
    }, slots.default?.())
  }
})
</script>
