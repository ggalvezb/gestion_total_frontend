<template>
  <AppShell>
    <div :style="{ padding: isMobile ? '16px' : '28px 32px' }">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <div>
          <h1 style="font-family:'DM Serif Display',serif;font-size:24px">Dashboard</h1>
          <p style="color:var(--text3);font-size:12px;margin-top:3px">Resumen estratégico · {{ fechaHoy }}</p>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px 12px">
          {{ cotizaciones.length }} cotizaciones en total
        </div>
      </div>

      <div v-if="loading" style="display:flex;justify-content:center;padding:80px">
        <AppSpinner :size="28"/>
      </div>

      <template v-else>
        <!-- KPI Cards -->
        <div :style="{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }">
          <div v-for="card in kpiCards" :key="card.label" :style="kpiStyle">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);font-weight:600;margin-bottom:6px">{{ card.label }}</div>
            <div :style="{ fontFamily:'\'DM Mono\',monospace', fontSize: isMobile ? '17px' : '22px', fontWeight:500, color: card.color || 'var(--text)', lineHeight:1.2 }">{{ card.value }}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:5px">{{ card.sub }}</div>
          </div>
        </div>

        <!-- Row 1: Evolución + Pipeline -->
        <div :style="{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'14px', marginBottom:'14px' }">

          <!-- Evolución mensual -->
          <div :style="cardStyle">
            <div :style="cardTitle">Ventas cerradas · últimos 6 meses</div>
            <svg viewBox="0 0 500 130" style="width:100%;display:block;overflow:visible">
              <!-- Horizontal grid lines -->
              <line x1="15" y1="10" x2="15" y2="105" stroke="var(--border)" stroke-width="1"/>
              <line x1="15" y1="105" x2="485" y2="105" stroke="var(--border)" stroke-width="1"/>
              <line v-for="n in 3" :key="n"
                x1="15" :y1="10 + (95/4)*n"
                x2="485" :y2="10 + (95/4)*n"
                stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4 4"/>
              <!-- Area fill -->
              <path v-if="lineAreaPath" :d="lineAreaPath" fill="rgba(201,168,76,.08)"/>
              <!-- Line -->
              <path v-if="linePath" :d="linePath" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
              <!-- Dots -->
              <g v-for="(pt, i) in linePoints" :key="i">
                <circle :cx="pt.x" :cy="pt.y" r="4" fill="#c9a84c"/>
              </g>
              <!-- X labels -->
              <text v-for="(m, i) in evolucionMensual" :key="'lbl'+i"
                :x="linePoints[i]?.x || 0" y="122"
                text-anchor="middle" font-size="9" fill="#888"
                font-family="Instrument Sans,sans-serif">{{ m.label }}</text>
            </svg>
            <div v-if="evolucionMensual.every(m => m.valor === 0)"
              style="text-align:center;color:var(--text3);font-size:12px;margin-top:4px">
              Sin ventas cerradas en este período
            </div>
          </div>

          <!-- Pipeline por estado -->
          <div :style="cardStyle">
            <div :style="cardTitle">Pipeline por estado</div>
            <div v-if="!porEstado.length" style="color:var(--text3);font-size:12px;padding:20px 0">Sin datos</div>
            <div v-for="row in porEstado" :key="row.estado" style="margin-bottom:13px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                <div style="display:flex;align-items:center;gap:7px">
                  <span :style="{ width:'7px', height:'7px', borderRadius:'50%', background: estadoColor(row.estado), display:'inline-block', flexShrink:0 }"/>
                  <span style="font-size:12px">{{ row.label }}</span>
                </div>
                <div style="display:flex;gap:12px;align-items:center">
                  <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text2)">{{ row.count }}</span>
                  <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);min-width:90px;text-align:right">{{ fmt(row.valor) }}</span>
                </div>
              </div>
              <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
                <div :style="{ height:'100%', width: estadoBarWidth(row.count) + '%', background: estadoColor(row.estado), borderRadius:'3px', transition:'width .5s ease' }"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Top clientes + Por ejecutivo -->
        <div :style="{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'14px' }">

          <!-- Top clientes -->
          <div :style="cardStyle">
            <div :style="cardTitle">Top 5 clientes · por valor facturado</div>
            <div v-if="!topClientes.length" style="color:var(--text3);font-size:12px;padding:20px 0">Sin datos</div>
            <div v-for="(cli, i) in topClientes" :key="cli.nombre" style="margin-bottom:13px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                <div style="display:flex;align-items:center;gap:7px">
                  <span style="font-size:10px;color:var(--accent);font-family:'DM Mono',monospace;font-weight:600;min-width:18px">#{{ i+1 }}</span>
                  <span style="font-size:12px;font-weight:500">{{ cli.nombre }}</span>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                  <span style="font-size:10px;color:var(--text3)">{{ cli.count }} cot.</span>
                  <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text2)">{{ fmt(cli.valor) }}</span>
                </div>
              </div>
              <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
                <div :style="{ height:'100%', width: clienteBarWidth(cli.valor) + '%', background:'var(--accent)', borderRadius:'3px', transition:'width .5s ease', opacity: 1 - i * 0.12 }"/>
              </div>
            </div>
          </div>

          <!-- Por ejecutivo -->
          <div :style="cardStyle">
            <div :style="cardTitle">Performance por ejecutivo</div>
            <div v-if="!porEjecutivo.length" style="color:var(--text3);font-size:12px;padding:20px 0">Sin datos</div>
            <table v-else style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th :style="thStyle">Ejecutivo</th>
                  <th :style="{ ...thStyle, textAlign:'right' }">Total</th>
                  <th :style="{ ...thStyle, textAlign:'right' }">Cierres</th>
                  <th :style="{ ...thStyle, textAlign:'right' }">Facturado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ej in porEjecutivo" :key="ej.nombre" style="border-top:1px solid var(--border)">
                  <td style="padding:9px 8px 9px 0;font-size:12px;font-weight:500">{{ ej.nombre }}</td>
                  <td style="padding:9px 8px;text-align:right;font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)">{{ ej.count }}</td>
                  <td style="padding:9px 8px;text-align:right;font-family:'DM Mono',monospace;font-size:11px;color:var(--text2)">{{ ej.cerradas }}</td>
                  <td style="padding:9px 0;text-align:right;font-family:'DM Mono',monospace;font-size:11px;color:var(--accent)">{{ fmt(ej.valor) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </template>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import AppShell from '@/components/layout/AppShell.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { cotizacionService, usuarioService } from '@/services'
import { fmt, ESTADOS } from '@/lib/utils'
import { useBreakpoint } from '@/composables/useBreakpoint'

const { isMobile } = useBreakpoint()

const fechaHoy = new Date().toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })

// ── Fetch ──────────────────────────────────────────────────
const { data: rawCots = ref([]), isLoading: loadingCots } = useQuery({
  queryKey: ['dashboard-cotizaciones'],
  queryFn: () => cotizacionService.listar({ limit: 200 }),
})
const { data: rawUsers = ref([]), isLoading: loadingUsers } = useQuery({
  queryKey: ['usuarios'],
  queryFn: usuarioService.listar,
})

const loading       = computed(() => loadingCots.value || loadingUsers.value)
const cotizaciones  = computed(() => rawCots.value  || [])
const usuarios      = computed(() => rawUsers.value || [])

// ── Grupos ─────────────────────────────────────────────────
const cerradas  = computed(() => cotizaciones.value.filter(c => ['comprada','despachado'].includes(c.estado)))
const pipeline  = computed(() => cotizaciones.value.filter(c => ['enviada','aprobada','en_compra'].includes(c.estado)))
const aprobadas = computed(() => cotizaciones.value.filter(c => ['aprobada','en_compra','comprada','despachado'].includes(c.estado)))
const perdidas  = computed(() => cotizaciones.value.filter(c => ['rechazada','expirada'].includes(c.estado)))

// ── KPI cards ──────────────────────────────────────────────
const facturacionTotal = computed(() => cerradas.value.reduce((s,c) => s + (c.calculos?.precio_venta_total || 0), 0))
const utilidadTotal    = computed(() => cerradas.value.reduce((s,c) => s + (c.calculos?.utilidad_monto    || 0), 0))
const pipelineValor    = computed(() => pipeline.value.reduce((s,c)  => s + (c.calculos?.precio_venta_total || 0), 0))
const tasaCierre       = computed(() => {
  const base = aprobadas.value.length + perdidas.value.length
  return base > 0 ? Math.round(aprobadas.value.length / base * 100) : 0
})
const margenPromedio = computed(() => {
  if (!cerradas.value.length) return 0
  const sum = cerradas.value.reduce((s,c) => {
    const v = c.calculos?.precio_venta_total || 0
    const u = c.calculos?.utilidad_monto    || 0
    return s + (v > 0 ? u / v : 0)
  }, 0)
  return Math.round(sum / cerradas.value.length * 100)
})

const kpiCards = computed(() => [
  {
    label: 'Facturación total',
    value: fmt(facturacionTotal.value),
    sub:   `${cerradas.value.length} deals cerrados`,
    color: 'var(--accent)',
  },
  {
    label: 'Utilidad generada',
    value: fmt(utilidadTotal.value),
    sub:   `Margen prom. ${margenPromedio.value}%`,
    color: 'var(--success)',
  },
  {
    label: 'Pipeline activo',
    value: fmt(pipelineValor.value),
    sub:   `${pipeline.value.length} cotizaciones en curso`,
  },
  {
    label: 'Tasa de conversión',
    value: `${tasaCierre.value}%`,
    sub:   `Sobre ${aprobadas.value.length + perdidas.value.length} enviadas`,
  },
])

// ── Por estado ─────────────────────────────────────────────
const ESTADO_ORDER = ['despachado','comprada','en_compra','aprobada','enviada','rechazada','expirada','borrador']

const porEstado = computed(() => {
  return ESTADO_ORDER
    .map(e => ({
      estado: e,
      label:  ESTADOS[e]?.label || e,
      count:  cotizaciones.value.filter(c => c.estado === e).length,
      valor:  cotizaciones.value.filter(c => c.estado === e).reduce((s,c) => s + (c.calculos?.precio_venta_total || 0), 0),
    }))
    .filter(r => r.count > 0)
})

const maxEstadoCount  = computed(() => Math.max(...porEstado.value.map(r => r.count), 1))
const estadoBarWidth  = (count) => Math.round(count / maxEstadoCount.value * 100)
const estadoColor     = (estado) => ({
  despachado: '#0d9488',
  comprada:   'var(--success)',
  en_compra:  'var(--accent)',
  aprobada:   '#60a5fa',
  enviada:    'var(--info)',
  borrador:   'var(--text3)',
  rechazada:  'var(--danger)',
  expirada:   'var(--text3)',
}[estado] || 'var(--accent)')

// ── Evolución mensual (SVG) ────────────────────────────────
const evolucionMensual = computed(() => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key:   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
      label: d.toLocaleDateString('es-CL', { month: 'short' }),
      valor: 0,
    })
  }
  cerradas.value.forEach(c => {
    try {
      const d   = new Date(c.creado_en)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const m   = months.find(m => m.key === key)
      if (m) m.valor += c.calculos?.precio_venta_total || 0
    } catch {}
  })
  return months
})

const SVG_PAD_X = 15, SVG_PAD_R = 15, SVG_PAD_T = 8, SVG_PAD_B = 25, SVG_W = 500, SVG_H = 130

const linePoints = computed(() => {
  const data   = evolucionMensual.value
  const maxVal = Math.max(...data.map(m => m.valor), 1)
  const chartW = SVG_W - SVG_PAD_X - SVG_PAD_R
  const chartH = SVG_H - SVG_PAD_T - SVG_PAD_B
  const n      = data.length
  return data.map((m, i) => ({
    x: SVG_PAD_X + (n <= 1 ? chartW / 2 : (i / (n - 1)) * chartW),
    y: SVG_PAD_T + chartH * (1 - m.valor / maxVal),
  }))
})

const linePath = computed(() => {
  const pts = linePoints.value
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i-1].x + pts[i].x) / 2
    d += ` C${cpX},${pts[i-1].y} ${cpX},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  return d
})

const lineAreaPath = computed(() => {
  const pts    = linePoints.value
  const bottom = SVG_H - SVG_PAD_B
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${bottom} L${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i-1].x + pts[i].x) / 2
    d += ` C${cpX},${pts[i-1].y} ${cpX},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  d += ` L${pts[pts.length-1].x},${bottom} Z`
  return d
})

// ── Top clientes ───────────────────────────────────────────
const topClientes = computed(() => {
  const map = {}
  cotizaciones.value
    .filter(c => ['aprobada','en_compra','comprada','despachado'].includes(c.estado))
    .forEach(c => {
      const n = c.cliente?.nombre || '—'
      if (!map[n]) map[n] = { nombre: n, valor: 0, count: 0 }
      map[n].valor += c.calculos?.precio_venta_total || 0
      map[n].count++
    })
  return Object.values(map).sort((a,b) => b.valor - a.valor).slice(0, 5)
})
const maxClienteValor = computed(() => Math.max(...topClientes.value.map(c => c.valor), 1))
const clienteBarWidth = (valor) => Math.round(valor / maxClienteValor.value * 100)

// ── Por ejecutivo ──────────────────────────────────────────
const porEjecutivo = computed(() => {
  const map = {}
  cotizaciones.value.forEach(c => {
    const eid  = c.ejecutivo_id
    const user = usuarios.value.find(u => u._id === eid)
    if (!map[eid]) map[eid] = { nombre: user?.nombre || 'Desconocido', valor: 0, count: 0, cerradas: 0 }
    map[eid].count++
    if (['comprada','despachado'].includes(c.estado)) {
      map[eid].valor   += c.calculos?.precio_venta_total || 0
      map[eid].cerradas++
    }
  })
  return Object.values(map).sort((a,b) => b.valor - a.valor)
})

// ── Styles ─────────────────────────────────────────────────
const kpiStyle  = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'18px 20px' }
const cardStyle = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'20px 22px' }
const cardTitle = { fontSize:'10px', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--text3)', fontWeight:600, marginBottom:'16px' }
const thStyle   = { textAlign:'left', fontSize:'9px', textTransform:'uppercase', letterSpacing:'.1em', color:'var(--text3)', padding:'0 8px 10px 0', fontWeight:600 }
</script>
