<template>
  <AppShell>
    <div class="fade-in" :style="isMobile ? { display:'flex', flexDirection:'column' } : { display:'grid', gridTemplateColumns:'1fr 320px', minHeight:'calc(100vh - 60px)' }">

      <!-- MAIN -->
      <div :style="isMobile ? { padding:'16px' } : { padding:'24px 28px', borderRight:'1px solid var(--border)', overflowY:'auto' }">
        <div style="margin-bottom:18px">
          <div style="display:flex;align-items:center;gap:10px">
            <h2 style="font-family:'DM Serif Display',serif;font-size:22px">
              {{ isNew ? 'Nueva cotización' : `Cotización ${numero}` }}
            </h2>
            <AppBadge v-if="!isNew && cotEstado" :estado="cotEstado.color" :label="cotEstado.label"/>
          </div>
          <p style="color:var(--text2);font-size:12px;margin-top:2px">{{ numero }}</p>
        </div>

        <!-- Step Tabs -->
        <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:22px">
          <button v-for="(s,i) in steps" :key="s" @click="tab=i" :style="stepTabStyle(i)">
            <span :style="stepDotStyle(i)">{{ i < tab ? '✓' : i+1 }}</span>
            {{ s }}
          </button>
        </div>

        <!-- TAB 0: PRODUCTOS -->
        <div v-if="tab === 0">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:14px">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px">
              Productos
              <span style="background:var(--accent-dim);color:var(--accent);border:1px solid rgba(201,168,76,.3);border-radius:20px;font-size:10px;padding:2px 8px;font-weight:600">{{ productos.length }} items</span>
            </div>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
            <table style="width:100%;border-collapse:collapse;margin-bottom:10px;min-width:540px">
              <thead>
                <tr>
                  <th v-for="h in ['Descripción','Cant.','Valor unit. $','Total $','Fuente','']" :key="h" :style="thStyle">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p,i) in productos" :key="i">
                  <td style="padding:3px 4px;width:36%"><MonoInput v-model="p.desc" :disabled="!editable" placeholder="Descripción"/></td>
                  <td style="padding:3px 4px;width:8%"><MonoInput v-model.number="p.cantidad" type="number" :disabled="!editable" min="1"/></td>
                  <td style="padding:3px 4px;width:16%"><MonoInput v-model.number="p.precio_compra" type="number" :disabled="!editable" min="0"/></td>
                  <td style="padding:3px 4px;width:14%"><MonoInput :value="fmtN(p.cantidad*p.precio_compra)" readonly style="color:var(--text2);background:var(--surface)"/></td>
                  <td style="padding:3px 4px;width:22%"><MonoInput v-model="p.link_fuente" type="url" :disabled="!editable" placeholder="https://..." style="font-size:11px"/></td>
                  <td style="padding:3px 4px;width:30px">
                    <button v-if="editable && productos.length > 1" @click="removeProducto(i)" :style="rmBtnStyle">×</button>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
            <button v-if="editable" @click="addProducto" :style="addRowStyle"
              @mouseenter="e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}"
              @mouseleave="e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)'}"
            >+ Agregar producto</button>
          </div>

          <!-- MÁRGENES (mismo tab) -->
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:14px">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);font-weight:600;margin-bottom:14px">Parámetros de margen</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
              <div><SideLabel>% Costo fijo</SideLabel><MonoInput v-model.number="parametros.pct_costo_fijo" type="number" :disabled="!editable"/></div>
              <div><SideLabel>% Utilidad</SideLabel><MonoInput v-model.number="parametros.pct_utilidad" type="number" :disabled="!editable"/></div>
              <div><SideLabel>Transporte $</SideLabel><MonoInput v-model.number="parametros.costo_transporte" type="number" :disabled="!editable"/></div>
            </div>
            <div style="height:1px;background:var(--border);margin:14px 0"/>
            <div :style="{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:'10px' }">
              <MetricBox label="Valor compra"        :value="fmt(calculos.valor_compra)"/>
              <MetricBox label="Precio costo final"  :value="fmt(calculos.precio_costo_final)"/>
              <MetricBox label="Utilidad"            :value="fmt(calculos.utilidad_monto)" color="var(--accent)"/>
              <MetricBox label="Precio venta c/IVA"  :value="fmt(calculos.precio_venta_total)" color="var(--success)"/>
            </div>
            <div style="height:1px;background:var(--border);margin:14px 0"/>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <MetricBox label="IVA débito (compra)"        :value="fmt(calculos.iva_debito)"/>
              <MetricBox label="IVA crédito fiscal (venta)" :value="fmt(calculos.iva_credito)"/>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end">
            <AppBtn size="sm" @click="tab=1">Siguiente: Ficha técnica <ChevronRight :size="13"/></AppBtn>
          </div>
        </div>

        <!-- TAB 1: FICHA TÉCNICA -->
        <div v-if="tab === 1">
          <FichaCard
            v-for="(p,i) in productos" :key="i"
            :producto="p"
            :editable="editable"
            @update-ficha="(key,val) => p.ficha[key] = val"
          />
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px">
            <AppBtn variant="ghost" size="sm" @click="tab=0"><ChevronLeft :size="13"/> Volver</AppBtn>
            <div style="display:flex;gap:8px">
              <AppBtn variant="ghost" size="sm" @click="descargarCotizacionPDF"><Download :size="13"/> Cotización PDF</AppBtn>
              <AppBtn size="sm" @click="descargarFichaTecnica"><Download :size="13"/> Descargar ficha</AppBtn>
            </div>
          </div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div :style="isMobile ? { padding:'16px', borderTop:'1px solid var(--border)' } : { padding:'22px', background:'var(--surface)', overflowY:'auto' }">
        <!-- Cliente -->
        <div style="margin-bottom:16px">
          <div :style="sideTitleStyle">Datos del cliente</div>
          <div style="margin-bottom:8px"><SideLabel>Razón social</SideLabel><SideInput v-model="cliente.nombre" :disabled="!editable"/></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div><SideLabel>RUT</SideLabel><SideInput v-model="cliente.rut" :disabled="!editable"/></div>
            <div><SideLabel>Ciudad</SideLabel><SideInput v-model="cliente.ciudad" :disabled="!editable"/></div>
          </div>
          <div><SideLabel>Dirección</SideLabel><SideInput v-model="cliente.direccion" :disabled="!editable"/></div>
        </div>
        <div style="height:1px;background:var(--border);margin:14px 0"/>

        <!-- Cotización -->
        <div style="margin-bottom:16px">
          <div :style="sideTitleStyle">Cotización</div>
          <div style="margin-bottom:8px"><SideLabel>N° Cotización</SideLabel><SideInput v-model="numero" :disabled="!isNew"/></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div><SideLabel>Validez (días)</SideLabel><SideInput v-model.number="validez" type="number" :disabled="!editable"/></div>
            <div><SideLabel>Despacho (días)</SideLabel><SideInput v-model.number="despacho" type="number" :disabled="!editable"/></div>
          </div>
        </div>

        <!-- Cambiar estado -->
        <template v-if="!isNew && transicionesPosibles.length">
          <div style="height:1px;background:var(--border);margin:14px 0"/>
          <div style="margin-bottom:16px">
            <div :style="sideTitleStyle">Cambiar estado</div>
            <button v-for="est in transicionesPosibles" :key="est" @click="handleEstado(est)" :style="estadoBtnStyle"
              @mouseenter="e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)';e.currentTarget.style.background='var(--accent-dim)'}"
              @mouseleave="e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';e.currentTarget.style.background='transparent'}"
            >→ Marcar como "{{ ESTADOS[est]?.label }}"</button>
          </div>
        </template>

        <div style="height:1px;background:var(--border);margin:14px 0"/>
        <!-- Acciones -->
        <div style="display:flex;flex-direction:column;gap:8px">
          <AppBtn v-if="editable" style="width:100%;justify-content:center" @click="handleSave()" :disabled="saving">
            {{ saving ? 'Guardando…' : isNew ? 'Guardar borrador' : 'Guardar cambios' }}
          </AppBtn>
          <AppBtn v-if="isNew" variant="ghost" style="width:100%;justify-content:center" @click="handleSave('enviada')" :disabled="saving">
            Guardar y enviar
          </AppBtn>
          <div style="height:1px;background:var(--border);margin:4px 0"/>
          <DocBtn @click="descargarCotizacionPDF"><Download :size="12"/> Descargar cotización PDF</DocBtn>
          <DocBtn @click="descargarFichaTecnica"><Download :size="12"/> Ficha técnica</DocBtn>
          <DocBtn dashed @click="descargarCotizacionInterna"><Download :size="12"/> Cotización interna</DocBtn>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, reactive, computed, watch, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { ChevronRight, ChevronLeft, Download } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import AppBtn from '@/components/ui/AppBtn.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import FichaCard from '@/components/cotizaciones/FichaCard.vue'
import { cotizacionService, costoFijoService } from '@/services'
import { fmt, fmtN, calcular, ESTADOS, TRANSICIONES, generarNumero } from '@/lib/utils'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useBreakpoint } from '@/composables/useBreakpoint'

const route  = useRoute()
const router = useRouter()
const qc     = useQueryClient()
const toast  = useToast()
const auth   = useAuthStore()
const { isMobile } = useBreakpoint()

const id    = computed(() => route.params.id)
const isNew = computed(() => id.value === 'nueva')

const tab       = ref(0)
const saving    = ref(false)
const numero    = ref(generarNumero())
const validez   = ref(30)
const despacho  = ref(3)
const cliente   = reactive({ nombre:'', rut:'', direccion:'', ciudad:'SANTIAGO' })
const parametros= reactive({ pct_costo_fijo:5, pct_utilidad:11, costo_transporte:20000 })
const productos = ref([{ idx:0, desc:'', cantidad:1, precio_compra:0, link_fuente:'', ficha:{ descripcion:'', foto_url:'' } }])

const { data: cot } = useQuery({
  queryKey: computed(() => ['cotizacion', id.value]),
  queryFn:  () => cotizacionService.obtener(id.value),
  enabled:  computed(() => !isNew.value),
})

const { data: costosFijos } = useQuery({
  queryKey: ['costos-fijos'],
  queryFn:  costoFijoService.listar,
})

watch(cot, (c) => {
  if (!c) return
  productos.value = c.productos?.map(p => ({ ...p, ficha: { ...(p.ficha || { descripcion:'', foto_url:'' }) } })) || []
  Object.assign(parametros, c.parametros)
  Object.assign(cliente, c.cliente)
  numero.value  = c.numero
  validez.value = c.validez_dias
  despacho.value= c.despacho_dias
}, { immediate: true })

const costosFijosTotal = computed(() => (costosFijos.value || []).filter(c=>c.activo).reduce((s,c)=>s+c.valor_mensual,0))
const calculos = computed(() => calcular(productos.value, parametros, costosFijosTotal.value))
const editable = computed(() => isNew.value || ['borrador','enviada'].includes(cot.value?.estado))
const cotEstado = computed(() => cot.value ? ESTADOS[cot.value.estado] : null)
const transicionesPosibles = computed(() => TRANSICIONES[cot.value?.estado] || [])

const steps = ['Productos y márgenes','Ficha técnica']

function addProducto() {
  productos.value.push({ idx: productos.value.length, desc:'', cantidad:1, precio_compra:0, link_fuente:'', ficha:{ descripcion:'', foto_url:'' } })
}
function removeProducto(i) {
  productos.value.splice(i, 1)
}

async function handleSave(nuevoEstado) {
  saving.value = true
  const payload = {
    numero: numero.value, validez_dias: validez.value, despacho_dias: despacho.value,
    cliente: { ...cliente }, parametros: { ...parametros },
    productos: productos.value.map((p,i) => ({ ...p, idx:i })),
  }
  try {
    if (isNew.value) {
      const created = await cotizacionService.crear(payload)
      if (nuevoEstado && nuevoEstado !== 'borrador') await cotizacionService.cambiarEstado(created._id, nuevoEstado)
      toast.success('Cotización creada')
      router.push(`/cotizacion/${created._id}`)
    } else {
      await cotizacionService.actualizar(id.value, payload)
      if (nuevoEstado) await cotizacionService.cambiarEstado(id.value, nuevoEstado)
      qc.invalidateQueries({ queryKey: ['cotizacion', id.value] })
      toast.success('Cotización guardada')
    }
  } catch {}
  saving.value = false
}

async function handleEstado(nuevo) {
  try {
    await cotizacionService.cambiarEstado(id.value, nuevo)
    qc.invalidateQueries({ queryKey: ['cotizacion', id.value] })
    toast.success(`Estado actualizado a "${ESTADOS[nuevo]?.label}"`)
    if (nuevo === 'en_compra') router.push(`/logistica/${id.value}`)
  } catch {}
}

// ── Descargas ──────────────────────────────────────────────
const _n    = v => Math.round(v || 0).toLocaleString('es-CL')
const _FONTS = '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">'

function descargarCotizacionPDF() {
  const c    = calculos.value
  const total = c.precio_venta_total, neto = c.neto_venta, iva = c.iva_credito
  const factor = total / (c.valor_compra || 1)
  const now = new Date()
  const fecha = now.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })
  const u = auth.user || {}

  const rows = productos.value.filter(p => p.desc && p.cantidad > 0).map((p, i) => {
    const unit = Math.round(p.precio_compra * factor / 1.19)
    return `<tr><td style="padding:10px 14px;border-bottom:1px solid #ede8de;color:#888">${i+1}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede8de">${p.desc}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede8de;text-align:right">${p.cantidad}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede8de;text-align:right;font-family:'DM Mono',monospace">${_n(unit)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #ede8de;text-align:right;font-family:'DM Mono',monospace">${_n(unit * p.cantidad)}</td></tr>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${numero.value}</title>${_FONTS}
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:white;font-family:'Instrument Sans',Arial,sans-serif;font-size:12px;color:#1a1a1a;padding:40px 48px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #c9a84c;margin-bottom:28px}
.co-name{font-family:'DM Serif Display',serif;font-size:28px}.co-sub{color:#666;font-size:11px;margin-top:4px}.co-sub p{margin-top:2px}
.doc-r{text-align:right}.doc-num{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;color:#c9a84c}.doc-date{color:#666;font-size:11px;margin-top:4px}
.lbl{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#999;font-weight:700;margin-bottom:10px}
.cgrid{display:grid;grid-template-columns:1fr 1fr;background:#f8f6f0;border-radius:8px;overflow:hidden;margin-bottom:28px}
.cc{padding:14px 18px;border-right:1px solid #e5e0d5;border-bottom:1px solid #e5e0d5}.cc:nth-child(even){border-right:none}.cc:nth-last-child(-n+2){border-bottom:none}
.ck{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#999;margin-bottom:4px}.cv{font-size:13px;font-weight:500}
table{width:100%;border-collapse:collapse;margin-bottom:24px}thead tr{background:#1a1a1a;color:white}
th{padding:10px 14px;font-size:10px;text-transform:uppercase;letter-spacing:.1em;font-weight:600;text-align:left}
th:last-child,th:nth-last-child(2),th:nth-last-child(3){text-align:right}tbody tr:nth-child(even){background:#faf8f3}tbody tr:last-child td{border-bottom:none}
.tbox{margin-left:auto;border:1px solid #e5e0d5;border-radius:8px;overflow:hidden;min-width:260px;margin-bottom:20px}
.trow{display:flex;justify-content:space-between;padding:10px 16px;font-size:12px;border-bottom:1px solid #e5e0d5}
.trow:last-child{border-bottom:none;background:#1a1a1a;color:white;font-weight:600}.trow span:last-child{font-family:'DM Mono',monospace}
.pay{background:#f8f6f0;border-radius:8px;padding:16px 18px;margin-bottom:16px}.pay-t{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#999;font-weight:700;margin-bottom:8px}
.pay p{color:#444;font-size:11px;line-height:1.6}footer{margin-top:28px;padding-top:14px;border-top:1px solid #e5e0d5;display:flex;justify-content:space-between;font-size:10px;color:#aaa}
@media print{@page{size:A4;margin:10mm 0}body{padding:20px 32px}}</style></head><body>
<div class="hdr"><div><div class="co-name">Abastecimiento Total</div><div class="co-sub"><p>Giro: abastecimiento integral de bienes y servicios.</p><p>Dirección: Juan Francisco Gonzalez 852, Ñuñoa.</p><p>email: correo@abastecimientototal.cl</p></div></div>
<div class="doc-r"><div class="lbl">Cotización</div><div class="doc-num">${numero.value}</div><div class="doc-date">${fecha}</div></div></div>
<div class="lbl">Detalle de Solicitud</div>
<div class="cgrid"><div class="cc"><div class="ck">Solicitante</div><div class="cv">${cliente.nombre||'—'}</div></div><div class="cc"><div class="ck">RUT</div><div class="cv">${cliente.rut||'—'}</div></div>
<div class="cc"><div class="ck">Dirección</div><div class="cv">${cliente.direccion||'—'}</div></div><div class="cc"><div class="ck">Ciudad</div><div class="cv">${cliente.ciudad||'—'}</div></div></div>
<p class="lbl" style="margin-bottom:18px">Ejecutivo: ${u.nombre||'—'} &nbsp;·&nbsp; ${u.telefono||'—'} &nbsp;·&nbsp; ${u.email||'—'}</p>
<table><thead><tr><th>#</th><th>Descripción</th><th style="text-align:right">Cant.</th><th style="text-align:right">Val. Unit. ($)</th><th style="text-align:right">Total ($)</th></tr></thead><tbody>${rows}</tbody></table>
<div style="display:flex;justify-content:flex-end"><div class="tbox"><div class="trow"><span>Neto</span><span>$ ${_n(neto)}</span></div><div class="trow"><span>IVA (19%)</span><span>$ ${_n(iva)}</span></div><div class="trow"><span>TOTAL</span><span>$ ${_n(total)}</span></div></div></div>
<p style="font-size:12px;color:#555;margin-bottom:14px">Días de despacho: <strong>${despacho.value||3} días</strong></p>
<div class="pay"><div class="pay-t">Datos de Pago</div><p>Banco Santander — Cuenta Corriente N° 70877171</p><p>Nombre: Gonzalo Galvez Bobadilla &nbsp;·&nbsp; RUT: 18.434.197-2</p></div>
<p style="color:#999;font-size:10px;text-align:center;margin-bottom:16px">Validez: ${validez.value} días &nbsp;·&nbsp; Precios en pesos chilenos incluyen IVA.</p>
<footer><span>Abastecimiento Total © ${now.getFullYear()}</span><span>${numero.value} — ${fecha}</span></footer>
<script>setTimeout(function(){window.print()},400)<\/script></body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

function descargarFichaTecnica() {
  const now = new Date()
  const fecha = now.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })

  const cards = productos.value.filter(p => p.cantidad > 0).map(p => {
    const fd = p.ficha || {}
    const foto = fd.foto_url
      ? `<img src="${fd.foto_url}" style="width:100%;height:210px;object-fit:contain;border-radius:6px;display:block">`
      : `<div style="width:100%;height:210px;background:#f0ece4;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px">Sin fotografía</div>`
    const desc = fd.descripcion
      ? `<span style="font-size:13px;color:#333;line-height:1.75;white-space:pre-wrap">${fd.descripcion}</span>`
      : `<span style="font-size:13px;color:#bbb;font-style:italic">Sin descripción</span>`
    return `<div style="margin-bottom:28px;padding:22px;background:#faf8f3;border:1px solid #e5e0d5;border-radius:10px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #e5e0d5">
        <div style="font-family:'DM Serif Display',serif;font-size:20px;flex:1">${p.desc}</div>
        <div style="background:#fff3cd;color:#7a5c00;border:1px solid #e0c060;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700">× ${p.cantidad} unidades</div>
      </div>
      <div style="display:grid;grid-template-columns:240px 1fr;gap:22px;align-items:start">
        <div>${foto}</div>
        <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.13em;color:#aaa;font-weight:700;margin-bottom:10px">Descripción del producto</div>${desc}</div>
      </div></div>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ficha ${numero.value}</title>${_FONTS}
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:white;font-family:'Instrument Sans',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:40px 48px}
@media print{@page{size:A4;margin:10mm 0}body{padding:20px 32px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #c9a84c;margin-bottom:28px">
  <div><div style="font-family:'DM Serif Display',serif;font-size:28px">Abastecimiento Total</div><div style="color:#999;font-size:11px;margin-top:5px">Ficha Técnica de Productos Ofertados</div></div>
  <div style="text-align:right"><div style="font-family:'DM Mono',monospace;font-size:20px;color:#c9a84c;font-weight:500">${numero.value}</div><div style="color:#999;font-size:11px;margin-top:4px">${fecha}</div></div>
</div>
${cards}
<div style="margin-top:20px;padding-top:14px;border-top:1px solid #e5e0d5;display:flex;justify-content:space-between;font-size:10px;color:#bbb">
  <span>Abastecimiento Total — Ficha Técnica</span><span>${numero.value} — ${fecha}</span>
</div>
<script>setTimeout(function(){window.print()},400)<\/script></body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

function descargarCotizacionInterna() {
  const c    = calculos.value
  const now  = new Date()
  const fecha = now.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })
  const pctFijo = parametros.pct_costo_fijo, pctUtil = parametros.pct_utilidad
  const transporte = parametros.costo_transporte

  const mRow = (lbl, val, color) =>
    `<tr><td style="padding:8px 14px;border-bottom:1px solid #f0ece4;color:#555;font-size:12px">${lbl}</td>
     <td style="padding:8px 14px;border-bottom:1px solid #f0ece4;text-align:right;font-family:monospace;font-weight:600;color:${color||'#1a1a1a'};font-size:12px">$${_n(val)}</td></tr>`

  const productRows = productos.value.filter(p => p.desc && p.cantidad > 0).map((p, i) => {
    const total = p.cantidad * p.precio_compra
    return `<tr style="background:${i%2===0?'#faf8f3':'white'}">
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;color:#888">${i+1}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;font-weight:500">${p.desc}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;text-align:right">${p.cantidad}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;text-align:right;font-family:monospace">$${_n(p.precio_compra)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;text-align:right;font-family:monospace">$${_n(total/1.19)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;text-align:right;font-family:monospace">$${_n(total - total/1.19)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;text-align:right;font-family:monospace;font-weight:600">$${_n(total)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #ede8de;font-size:10px">${p.link_fuente?`<a href="${p.link_fuente}" style="color:#c9a84c;word-break:break-all">${p.link_fuente}</a>`:'—'}</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cotización Interna ${numero.value}</title>${_FONTS}
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;background:white;padding:36px 44px}
a{color:#c9a84c;text-decoration:underline}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:3px solid #c9a84c;margin-bottom:24px">
  <div><div style="font-size:24px;font-weight:700">Abastecimiento Total</div>
  <div style="color:#999;font-size:11px;margin-top:3px">Cotización Interna — Uso interno
    <span style="background:#fff3cd;color:#7a5c00;border:1px solid #e0c060;border-radius:3px;padding:1px 7px;font-size:10px;font-weight:700;margin-left:6px">CONFIDENCIAL</span></div></div>
  <div style="text-align:right"><div style="font-family:monospace;font-size:18px;color:#c9a84c;font-weight:600">${numero.value}</div><div style="color:#999;font-size:11px;margin-top:3px">${fecha}</div></div>
</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#aaa;font-weight:700;margin-bottom:8px">Parámetros</div>
<div style="display:flex;gap:10px;margin-bottom:22px">
  <div style="flex:1;background:#f8f6f0;border-radius:5px;padding:10px 14px"><div style="font-size:9px;text-transform:uppercase;color:#aaa;margin-bottom:3px">% Costo Fijo</div><div style="font-size:15px;font-weight:600">${pctFijo}%</div></div>
  <div style="flex:1;background:#f8f6f0;border-radius:5px;padding:10px 14px"><div style="font-size:9px;text-transform:uppercase;color:#aaa;margin-bottom:3px">% Utilidad</div><div style="font-size:15px;font-weight:600">${pctUtil}%</div></div>
  <div style="flex:1;background:#f8f6f0;border-radius:5px;padding:10px 14px"><div style="font-size:9px;text-transform:uppercase;color:#aaa;margin-bottom:3px">Transporte</div><div style="font-size:15px;font-weight:600;font-family:monospace">$${_n(transporte)}</div></div>
</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#aaa;font-weight:700;margin-bottom:8px">Detalle de Productos</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:22px">
  <thead><tr style="background:#1a1a1a;color:white">
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:left">#</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:left">Descripción</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:right">Cant.</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:right">Precio Compra</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:right">Neto</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:right">IVA</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:right">Total c/IVA</th>
    <th style="padding:9px 12px;font-size:10px;text-transform:uppercase;font-weight:600;text-align:left">Fuente</th>
  </tr></thead><tbody>${productRows}</tbody>
</table>
<div style="display:flex;gap:20px">
  <div style="flex:1">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#aaa;font-weight:700;margin-bottom:8px">Resumen de Costos</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e0d5;border-radius:6px;overflow:hidden"><tbody>
      ${mRow('Valor Compra Total', c.valor_compra)}
      ${mRow('IVA Débito (Compra)', c.iva_debito)}
      ${mRow('Costo Fijo ('+pctFijo+'%)', c.costo_fijo_monto)}
      ${mRow('Costo Transporte', transporte)}
      ${mRow('Precio Costo Final', c.precio_costo_final)}
      ${mRow('Utilidad ('+pctUtil+'%)', c.utilidad_monto, '#b8860b')}
      ${mRow('IVA Crédito Fiscal (Venta)', c.iva_credito)}
    </tbody></table>
  </div>
  <div style="width:260px">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#aaa;font-weight:700;margin-bottom:8px">Precio Final</div>
    <div style="border:1px solid #e5e0d5;border-radius:6px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #e5e0d5;font-size:12px"><span>Neto Venta</span><span style="font-family:monospace">$${_n(c.neto_venta)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #e5e0d5;font-size:12px"><span>IVA (19%)</span><span style="font-family:monospace">$${_n(c.iva_credito)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:11px 14px;background:#1a1a1a;color:white;font-size:13px;font-weight:700"><span>PRECIO VENTA FINAL</span><span style="font-family:monospace">$${_n(c.precio_venta_total)}</span></div>
    </div>
  </div>
</div>
<div style="margin-top:28px;padding-top:14px;border-top:1px solid #e5e0d5;display:flex;justify-content:space-between;font-size:10px;color:#bbb">
  <span>Uso interno — Abastecimiento Total</span><span>${numero.value} — ${fecha}</span>
</div></body></html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `cotizacion_interna_${numero.value}.html`; a.click()
  URL.revokeObjectURL(url)
}

// Local helpers
const SideLabel = defineComponent({ props:[''], setup: (_,{slots})=> ()=>h('label',{style:{display:'block',fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',fontWeight:600,marginBottom:'5px'}},slots.default?.()) })
const SideInput = defineComponent({ props:['modelValue','disabled','type'],emits:['update:modelValue'], setup: (p,{emit})=>()=>h('input',{value:p.modelValue,disabled:p.disabled,type:p.type||'text',onInput:e=>emit('update:modelValue',e.target.value),style:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'8px 10px',color:'var(--text)',fontFamily:"'Instrument Sans',sans-serif",fontSize:'13px',outline:'none',marginBottom:'0'}}) })
const MonoInput = defineComponent({ props:['modelValue','disabled','type','readonly'],emits:['update:modelValue'], setup: (p,{attrs,emit})=>()=>h('input',{...attrs,value:p.modelValue,disabled:p.disabled,readonly:p.readonly,type:p.type||'text',onInput:e=>emit('update:modelValue',e.target.value),style:{width:'100%',background:p.readonly?'var(--surface)':'var(--surface2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'7px 9px',color:p.readonly?'var(--text2)':'var(--text)',fontFamily:"'DM Mono',monospace",fontSize:'12px',outline:'none'}}) })
const MetricBox = defineComponent({ props:['label','value','color'], setup: (p)=>()=>h('div',{style:{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'12px 14px'}},[h('div',{style:{fontSize:'10px',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text3)',fontWeight:600,marginBottom:'5px'}},p.label),h('div',{style:{fontFamily:"'DM Mono',monospace",fontSize:'16px',color:p.color||'var(--text)'}},p.value)]) })
const DocBtn = defineComponent({ props:['dashed'], emits:['click'], setup: (p,{slots,emit})=>()=>h('button',{onClick:(e)=>emit('click',e),style:{width:'100%',background:'transparent',border:`1px ${p.dashed?'dashed':'solid'} var(--border)`,borderRadius:'6px',color:p.dashed?'var(--text3)':'var(--text2)',fontSize:'12px',padding:'9px 14px',cursor:'pointer',fontFamily:"'Instrument Sans',sans-serif",display:'flex',alignItems:'center',gap:'8px',transition:'all .15s'}},slots.default?.()) })

const sideTitleStyle = { fontSize:'10px', textTransform:'uppercase', letterSpacing:'.12em', color:'var(--text3)', fontWeight:600, marginBottom:'12px' }
const thStyle = { fontSize:'10px', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text3)', padding:'0 5px 8px', textAlign:'left', fontWeight:600 }
const rmBtnStyle = { background:'transparent', border:'1px solid var(--border)', borderRadius:'4px', width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text3)', fontSize:'15px' }
const addRowStyle = { width:'100%', background:'transparent', border:'1px dashed var(--border)', borderRadius:'6px', color:'var(--text2)', fontSize:'12px', padding:'8px', cursor:'pointer', fontFamily:"'Instrument Sans',sans-serif", marginTop:'4px', transition:'all .15s' }
const estadoBtnStyle = { width:'100%', background:'transparent', border:'1px solid var(--border)', borderRadius:'6px', padding:'8px 14px', color:'var(--text2)', fontSize:'12px', cursor:'pointer', textAlign:'left', fontFamily:"'Instrument Sans',sans-serif", transition:'all .15s', marginBottom:'6px', display:'block' }

const stepTabStyle = (i) => ({
  padding:'10px 20px', fontSize:'13px',
  color: i === tab.value ? 'var(--accent)' : i < tab.value ? 'var(--text3)' : 'var(--text2)',
  borderBottom:`2px solid ${i === tab.value ? 'var(--accent)' : 'transparent'}`,
  marginBottom:'-1px', background:'none', border:'none', borderBottomStyle:'solid',
  borderBottomWidth:'2px', borderBottomColor: i === tab.value ? 'var(--accent)' : 'transparent',
  cursor:'pointer', fontFamily:"'Instrument Sans',sans-serif",
  display:'flex', alignItems:'center', gap:'7px',
})
const stepDotStyle = (i) => ({
  width:'18px', height:'18px', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center',
  fontSize:'9px', fontWeight:700, flexShrink:0,
  background: i < tab.value ? 'var(--success)' : i === tab.value ? 'var(--accent)' : 'var(--surface2)',
  border:`1px solid ${i < tab.value ? 'var(--success)' : i === tab.value ? 'var(--accent)' : 'var(--border)'}`,
  color: i <= tab.value ? '#0f0e0c' : 'var(--text3)',
})
</script>
