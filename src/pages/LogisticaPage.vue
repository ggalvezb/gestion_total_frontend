<template>
  <AppShell>
    <div :style="isMobile ? {} : { display:'grid', gridTemplateColumns:'300px 1fr', minHeight:'calc(100vh - 60px)' }">

      <!-- PANEL LISTA -->
      <div v-show="!isMobile || !selectedId" style="border-right:1px solid var(--border);background:var(--surface);overflow-y:auto">
        <div style="padding:18px 20px 14px;border-bottom:1px solid var(--border)">
          <div style="font-family:'DM Serif Display',serif;font-size:16px">Cotizaciones en gestión</div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px">{{ pendientes }} pendientes de gestión</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">
            <button
              v-for="f in FILTROS_LOG" :key="String(f.key)"
              @click="estadoFiltro = f.key"
              :style="filtroStyle(f.key)"
            >{{ f.label }}</button>
          </div>
        </div>

        <div v-if="loadingList" style="display:flex;justify-content:center;padding:32px">
          <AppSpinner />
        </div>
        <template v-else>
          <div
            v-for="cot in cotizacionesFiltradas" :key="cot._id"
            @click="router.push(`/logistica/${cot._id}`)"
            :style="cotItemStyle(cot._id)"
            @mouseenter="e=>{ if(cot._id!==selectedId) e.currentTarget.style.background='var(--surface2)' }"
            @mouseleave="e=>{ if(cot._id!==selectedId) e.currentTarget.style.background='transparent' }"
          >
            <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--accent);margin-bottom:3px">{{ cot.numero }}</div>
            <div style="font-size:13px;font-weight:500">{{ cot.cliente?.nombre }}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:3px;display:flex;gap:8px;align-items:center">
              <AppBadge :estado="ESTADOS[cot.estado]?.color" :label="ESTADOS[cot.estado]?.label"/>
              <span>{{ fmt(cot.calculos?.precio_venta_total) }}</span>
            </div>
            <!-- mini progress -->
            <div style="height:3px;background:var(--border);border-radius:2px;margin-top:6px;overflow:hidden">
              <div :style="miniProgStyle(cot)"/>
            </div>
          </div>
          <div v-if="!cotizaciones.length" style="padding:24px;text-align:center;color:var(--text3);font-size:13px">
            Sin cotizaciones aprobadas
          </div>
        </template>
      </div>

      <!-- PANEL DETALLE -->
      <div v-if="selectedCot && (!isMobile || selectedId)" key="detail" class="fade-in" :style="{ padding: isMobile ? '16px' : '28px', overflowY:'auto' }">
        <!-- Volver (solo mobile) -->
        <button v-if="isMobile" @click="router.push('/logistica')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--accent);font-size:13px;cursor:pointer;padding:0;margin-bottom:16px;font-family:'Instrument Sans',sans-serif">
          ← Volver a la lista
        </button>

        <!-- Header detalle -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-family:'DM Mono',monospace;font-size:12px;color:var(--accent);margin-bottom:4px">{{ selectedCot.numero }}</div>
            <h2 style="font-family:'DM Serif Display',serif;font-size:22px">{{ selectedCot.cliente?.nombre }}</h2>
            <p style="color:var(--text2);font-size:13px;margin-top:3px">
              {{ selectedCot.cliente?.direccion }} · {{ selectedCot.cliente?.ciudad }} · {{ selectedCot.cliente?.rut }}
            </p>
          </div>
          <div style="text-align:right">
            <AppBadge :estado="ESTADOS[selectedCot.estado]?.color" :label="ESTADOS[selectedCot.estado]?.label"/>
            <div style="font-family:'DM Mono',monospace;font-size:18px;margin-top:8px">{{ fmt(selectedCot.calculos?.precio_venta_total) }}</div>
            <div style="font-size:11px;color:var(--text3)">precio venta c/IVA</div>
            <AppBtn v-if="selectedCot.estado === 'aprobada'" size="sm" style="margin-top:10px" @click="iniciarCompra">
              <Plus :size="13"/> Iniciar proceso de compra
            </AppBtn>
          </div>
        </div>

        <!-- Tabs detalle -->
        <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:20px">
          <button v-for="[key,lbl] in dtabs" :key="key" @click="dtab=key" :style="dtabStyle(key)">{{ lbl }}</button>
        </div>

        <!-- Tab Compras -->
        <template v-if="dtab==='compras'">
          <div v-if="selectedCot.estado==='aprobada'" style="text-align:center;padding:40px;color:var(--text3)">
            Inicia el proceso de compra para registrar los items
          </div>
          <div v-else-if="loadingCompra" style="display:flex;justify-content:center;padding:40px"><AppSpinner :size="24"/></div>
          <template v-else-if="compra">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div style="font-size:12px;color:var(--text2)">
                {{ compra.items?.length }} productos · Total pagado: {{ fmt(compra.total_pagado) }}
              </div>
              <AppBtn size="sm" @click="parcialModal=null;showParcialModal=false"><Plus :size="13"/> Registrar compra</AppBtn>
            </div>
            <ItemCard
              v-for="item in compra.items" :key="item._id"
              :item="item"
              @add-parcial="openParcial(item)"
              @edit-parcial="openEditParcial"
              @delete-parcial="handleDeleteParcial"
            />
          </template>
        </template>

        <!-- Tab Documentos -->
        <template v-if="dtab==='documentos'">
          <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
            <AppBtn size="sm" @click="showUpload=true"><Upload :size="13"/> Subir documento</AppBtn>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <DocGroup title="Documentos de compra" color="#c4884a">
              <DocItem v-for="d in docsCompra" :key="d._id" :doc="d" @delete="eliminarDoc(d._id)"/>
              <div v-if="!docsCompra.length" style="font-size:12px;color:var(--text3);padding:6px 0">Sin documentos de compra</div>
            </DocGroup>
            <DocGroup title="Documentos de venta" color="var(--info)">
              <template v-for="tipo in VENTA_TIPOS" :key="tipo">
                <DocItem v-if="docVentaMap[tipo]" :doc="docVentaMap[tipo]" @delete="eliminarDoc(docVentaMap[tipo]._id)"/>
                <DocItemEmpty v-else :label="TIPOS_DOC[tipo]?.label"/>
              </template>
            </DocGroup>
          </div>
        </template>
      </div>
      <div v-else style="display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:14px">
        Selecciona una cotización de la lista
      </div>
    </div>

    <!-- Modal parcial -->
    <AppModal :open="showParcialModal" :title="editMode ? `Editar compra — ${parcialItem?.producto_desc}` : `Compra parcial — ${parcialItem?.producto_desc}`" @close="showParcialModal=false">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><ModalLabel>Proveedor</ModalLabel><ModalInput v-model="parcialForm.proveedor" placeholder="Nombre del proveedor"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><ModalLabel>Cantidad</ModalLabel><ModalInput v-model.number="parcialForm.cantidad" type="number" min="1"/></div>
          <div><ModalLabel>Precio unit. $</ModalLabel><ModalInput v-model.number="parcialForm.precio_unit" type="number" min="0"/></div>
        </div>
        <div><ModalLabel>Notas (opcional)</ModalLabel><ModalInput v-model="parcialForm.notas" placeholder="Notas adicionales"/></div>
        <div style="height:1px;background:var(--border);margin:4px 0"/>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <AppBtn variant="ghost" size="sm" @click="showParcialModal=false">Cancelar</AppBtn>
          <AppBtn size="sm" @click="guardarParcial" :disabled="savingParcial">{{ savingParcial ? 'Guardando…' : editMode ? 'Actualizar' : 'Registrar compra' }}</AppBtn>
        </div>
      </div>
    </AppModal>

    <!-- Modal upload -->
    <AppModal :open="showUpload" title="Subir documento" @close="showUpload=false">
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><ModalLabel>Tipo de documento</ModalLabel>
          <select v-model="uploadForm.tipo" :style="modalSelectStyle">
            <option v-for="(v,k) in TIPOS_DOC" :key="k" :value="k">{{ v.label }}</option>
          </select>
        </div>
        <div>
          <ModalLabel>Archivo (PDF / imagen)</ModalLabel>
          <div @click="$refs.uploadInput.click()" :style="uploadZoneStyle"
            @mouseenter="e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}"
            @mouseleave="e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)'}"
          >
            <template v-if="uploadForm.file">
              <div style="font-weight:500;color:var(--text)">{{ uploadForm.file.name }}</div>
              <div style="font-size:11px;margin-top:4px">{{ (uploadForm.file.size/1024).toFixed(1) }} KB</div>
            </template>
            <template v-else>
              <Upload :size="18" style="margin:0 auto 8px"/>
              <div>{{ isMobile ? 'Toca para seleccionar archivo' : 'Click para seleccionar archivo' }}</div>
            </template>
          </div>
          <input ref="uploadInput" type="file" accept=".pdf,image/*" style="display:none" @change="e=>uploadForm.file=e.target.files[0]"/>
          <input ref="cameraInput" type="file" accept="image/*" capture="environment" style="display:none" @change="e=>uploadForm.file=e.target.files[0]"/>
          <button v-if="isMobile" @click="$refs.cameraInput.click()" style="width:100%;margin-top:8px;background:transparent;border:1px solid var(--border);border-radius:6px;padding:10px;color:var(--text2);font-size:13px;font-family:'Instrument Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
            📷 Tomar foto con la cámara
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><ModalLabel>Monto (opcional)</ModalLabel><ModalInput v-model.number="uploadForm.monto" type="number" placeholder="0"/></div>
          <div><ModalLabel>N° Documento</ModalLabel><ModalInput v-model="uploadForm.numero_doc" placeholder="FAC-001"/></div>
        </div>
        <div style="height:1px;background:var(--border);margin:4px 0"/>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <AppBtn variant="ghost" size="sm" @click="showUpload=false">Cancelar</AppBtn>
          <AppBtn size="sm" @click="subirDocumento" :disabled="savingUpload">{{ savingUpload?'Subiendo…':'Subir documento' }}</AppBtn>
        </div>
      </div>
    </AppModal>
  </AppShell>
</template>

<script setup>
import { ref, computed, reactive, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Plus, Upload, Trash2, ExternalLink, Pencil } from 'lucide-vue-next'
import AppShell  from '@/components/layout/AppShell.vue'
import AppBtn    from '@/components/ui/AppBtn.vue'
import AppBadge  from '@/components/ui/AppBadge.vue'
import AppModal  from '@/components/ui/AppModal.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { cotizacionService, compraService, documentoService } from '@/services'
import { fmt, fmtFecha, ESTADOS, TIPOS_DOC, VENTA_TIPOS } from '@/lib/utils'
import { useToast } from '@/composables/useToast'

const route  = useRoute()
const router = useRouter()
const qc     = useQueryClient()
const toast  = useToast()

const { isMobile } = useBreakpoint()
const selectedId   = computed(() => route.params.id)
const dtab         = ref('compras')
const dtabs        = [['compras','Compras'],['documentos','Documentos']]
const estadoFiltro = ref(null)

const FILTROS_LOG = [
  { key: null,        label: 'Todas'     },
  { key: 'aprobada',  label: 'Aprobada'  },
  { key: 'en_compra', label: 'En compra' },
  { key: 'comprada',  label: 'Completada'},
  { key: 'despachado',label: 'Despachada'},
]

// ── Fetch cotizaciones aprobadas ──────────────────────────
const { data: cotizaciones = ref([]), isLoading: loadingList } = useQuery({
  queryKey: ['cotizaciones-logistica'],
  queryFn: () => Promise.all([
    cotizacionService.listar({ estado:'aprobada' }),
    cotizacionService.listar({ estado:'en_compra' }),
    cotizacionService.listar({ estado:'comprada' }),
    cotizacionService.listar({ estado:'despachado' }),
  ]).then(([a,b,c,d]) => [...a,...b,...c,...d]),
})

const selectedCot        = computed(() => (cotizaciones.value||[]).find(c => c._id === selectedId.value))
const pendientes         = computed(() => (cotizaciones.value||[]).filter(c=>['aprobada','en_compra'].includes(c.estado)).length)
const cotizacionesFiltradas = computed(() => {
  const list = cotizaciones.value || []
  return estadoFiltro.value ? list.filter(c => c.estado === estadoFiltro.value) : list
})

// ── Fetch compra ──────────────────────────────────────────
const { data: compra, isLoading: loadingCompra } = useQuery({
  queryKey: computed(() => ['compra', selectedId.value]),
  queryFn:  () => compraService.obtenerPorCotizacion(selectedId.value),
  enabled:  computed(() => !!selectedId.value && ['en_compra','comprada','despachado'].includes(selectedCot.value?.estado)),
})

// ── Fetch documentos ──────────────────────────────────────
const { data: documentos = ref([]) } = useQuery({
  queryKey: computed(() => ['documentos', selectedId.value]),
  queryFn:  () => documentoService.listar(selectedId.value),
  enabled:  computed(() => !!selectedId.value),
})

const docsCompra  = computed(() => (documentos.value||[]).filter(d=>['factura_compra','boleta_compra'].includes(d.tipo)))
const docVentaMap = computed(() => {
  const map = {}
  ;(documentos.value||[]).filter(d=>VENTA_TIPOS.includes(d.tipo)).forEach(d=>map[d.tipo]=d)
  return map
})

// ── Iniciar compra ────────────────────────────────────────
async function iniciarCompra() {
  try {
    await cotizacionService.cambiarEstado(selectedId.value, 'en_compra')
    qc.invalidateQueries({ queryKey: ['cotizaciones-logistica'] })
    qc.invalidateQueries({ queryKey: ['compra', selectedId.value] })
    toast.success('Proceso de compra iniciado')
  } catch {}
}

// ── Parcial modal ─────────────────────────────────────────
const showParcialModal = ref(false)
const savingParcial    = ref(false)
const parcialItem      = ref(null)
const parcialForm      = reactive({ proveedor:'', cantidad:1, precio_unit:0, notas:'' })
const editMode         = ref(false)
const editItemId       = ref(null)
const editParcialIdx   = ref(null)

function openParcial(item) {
  editMode.value = false
  parcialItem.value = item
  Object.assign(parcialForm, { proveedor:'', cantidad:1, precio_unit:0, notas:'' })
  showParcialModal.value = true
}

function openEditParcial({ item, idx }) {
  editMode.value = true
  editItemId.value = item._id
  editParcialIdx.value = idx
  parcialItem.value = item
  const parc = item.parciales[idx]
  Object.assign(parcialForm, { proveedor: parc.proveedor, cantidad: parc.cantidad, precio_unit: parc.precio_unit, notas: parc.notas || '' })
  showParcialModal.value = true
}

async function guardarParcial() {
  if (!parcialForm.proveedor || !parcialForm.precio_unit) return toast.error('Completa todos los campos')
  savingParcial.value = true
  try {
    if (editMode.value) {
      await compraService.actualizarParcial(editItemId.value, editParcialIdx.value, { ...parcialForm })
      toast.success('Compra actualizada')
    } else {
      await compraService.agregarParcial(parcialItem.value._id, { ...parcialForm })
      toast.success('Compra parcial registrada')
    }
    qc.invalidateQueries({ queryKey: ['compra', selectedId.value] })
    showParcialModal.value = false
    Object.assign(parcialForm, { proveedor:'', cantidad:1, precio_unit:0, notas:'' })
  } catch {}
  savingParcial.value = false
}

async function handleDeleteParcial({ itemId, idx }) {
  if (!confirm('¿Eliminar esta compra parcial?')) return
  try {
    await compraService.eliminarParcial(itemId, idx)
    qc.invalidateQueries({ queryKey: ['compra', selectedId.value] })
    toast.success('Compra eliminada')
  } catch {}
}

// ── Upload modal ──────────────────────────────────────────
const showUpload  = ref(false)
const savingUpload= ref(false)
const uploadForm  = reactive({ tipo:'factura_compra', file:null, monto:'', numero_doc:'' })

async function subirDocumento() {
  if (!uploadForm.file) return toast.error('Selecciona un archivo')
  savingUpload.value = true
  try {
    await documentoService.subir(selectedId.value, uploadForm.file, uploadForm.tipo, uploadForm.monto||undefined, uploadForm.numero_doc||undefined)
    qc.invalidateQueries({ queryKey: ['documentos', selectedId.value] })
    toast.success('Documento subido')
    showUpload.value = false
    Object.assign(uploadForm, { tipo:'factura_compra', file:null, monto:'', numero_doc:'' })
  } catch {}
  savingUpload.value = false
}

async function eliminarDoc(docId) {
  if (!confirm('¿Eliminar este documento?')) return
  try {
    await documentoService.eliminar(docId)
    qc.invalidateQueries({ queryKey: ['documentos', selectedId.value] })
    toast.success('Documento eliminado')
  } catch {}
}

// ── Styles ────────────────────────────────────────────────
const filtroStyle = (key) => ({
  background: estadoFiltro.value === key ? 'var(--accent-dim)' : 'transparent',
  border: `1px solid ${estadoFiltro.value === key ? 'rgba(201,168,76,.4)' : 'var(--border)'}`,
  color: estadoFiltro.value === key ? 'var(--accent)' : 'var(--text2)',
  borderRadius: '20px', fontSize: '11px', padding: '3px 10px', cursor: 'pointer',
  fontFamily: "'Instrument Sans',sans-serif", transition: 'all .15s',
})
const cotItemStyle = (id) => ({
  padding:'13px 20px', cursor:'pointer',
  borderLeft:`3px solid ${id===selectedId.value ? 'var(--accent)' : 'transparent'}`,
  background: id===selectedId.value ? 'var(--accent-dim)' : 'transparent',
  transition:'all .15s',
})
const miniProgStyle = (cot) => ({
  height:'100%', borderRadius:'2px', transition:'width .3s',
  background: cot.estado==='despachado' ? '#0d9488' : cot.estado==='comprada' ? 'var(--success)' : 'var(--accent)',
  width: ['comprada','despachado'].includes(cot.estado) ? '100%' : cot.estado==='en_compra' ? '50%' : '0%',
})
const dtabStyle = (key) => ({
  background:'none', border:'none',
  borderBottom:`2px solid ${dtab.value===key?'var(--accent)':'transparent'}`,
  padding:'9px 18px', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px',
  color: dtab.value===key?'var(--accent)':'var(--text2)', cursor:'pointer',
  marginBottom:'-1px', transition:'all .15s',
})
const modalSelectStyle = { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'9px 12px', color:'var(--text)', fontFamily:"'Instrument Sans',sans-serif", fontSize:'13px', outline:'none' }
const uploadZoneStyle  = { border:'2px dashed var(--border)', borderRadius:'6px', padding:'20px', textAlign:'center', cursor:'pointer', color:'var(--text2)', fontSize:'13px', transition:'all .15s' }

// Local components
const ModalLabel  = defineComponent({ setup: (_,{slots})=>()=>h('label',{style:{display:'block',fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',fontWeight:600,marginBottom:'5px'}},slots.default?.()) })
const ModalInput  = defineComponent({ props:['modelValue','type','placeholder','min'],emits:['update:modelValue'], setup: (p,{emit})=>()=>h('input',{value:p.modelValue,type:p.type||'text',placeholder:p.placeholder,min:p.min,onInput:e=>emit('update:modelValue',e.target.value),style:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'6px',padding:'9px 12px',color:'var(--text)',fontFamily:"'Instrument Sans',sans-serif",fontSize:'13px',outline:'none'}}) })
const DocGroup    = defineComponent({ props:['title','color'], setup: (p,{slots})=>()=>h('div',{style:{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'10px',padding:'14px'}},[h('div',{style:{fontSize:'10px',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:600,marginBottom:'10px',color:p.color,display:'flex',alignItems:'center',gap:'6px'}},[h('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'currentColor',display:'inline-block'}}),p.title]),slots.default?.()])})
const DocItem     = defineComponent({ props:['doc'],emits:['delete'], setup: (p,{emit})=>()=>h('div',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderBottom:'1px solid var(--border)'}},[h('div',{style:{width:'28px',height:'28px',borderRadius:'5px',background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'var(--text2)',flexShrink:0,fontFamily:"'DM Mono',monospace"}},'PDF'),h('div',{style:{flex:1}},[h('div',{style:{fontSize:'12px'}},p.doc.nombre_archivo),h('div',{style:{fontSize:'11px',color:'var(--text3)'}},`${fmtFecha(p.doc.subido_en)}${p.doc.monto?` · ${fmt(p.doc.monto)}`:''}`)]),h('button',{onClick:()=>emit('delete'),style:{background:'none',border:'none',cursor:'pointer',color:'var(--text3)'}},'🗑')]) })
const DocItemEmpty= defineComponent({ props:['label'], setup: (p)=>()=>h('div',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderBottom:'1px solid var(--border)',opacity:.45}},[h('div',{style:{width:'28px',height:'28px',borderRadius:'5px',background:'var(--surface)',border:'1px dashed var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'var(--text3)',flexShrink:0}},'—'),h('div',{style:{flex:1}},[h('div',{style:{fontSize:'12px',color:'var(--text3)'}},p.label),h('div',{style:{fontSize:'11px',color:'var(--text3)'}},'Pendiente')])]) })
const ItemCard    = defineComponent({ props:['item'],emits:['add-parcial','edit-parcial','delete-parcial'], setup: (p,{emit})=>{
  const pct = computed(()=>p.item.cantidad_total>0?(p.item.cantidad_comprada/p.item.cantidad_total)*100:0)
  const iconBtn = (color, icon, onClick) => h('button',{onClick,style:{background:'transparent',border:`1px solid ${color==='danger'?'rgba(239,68,68,.3)':'var(--border)'}`,borderRadius:'4px',width:'22px',height:'22px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:color==='danger'?'rgb(239,68,68)':'var(--text3)',flexShrink:0}},h(icon,{size:11}))
  return ()=>h('div',{style:{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'10px',padding:'14px 16px',marginBottom:'10px'}},[
    h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}},[
      h('div',{style:{fontWeight:500,flex:1,fontSize:'13px'}},p.item.producto_desc),
      h('div',{style:{fontFamily:"'DM Mono',monospace",fontSize:'12px',color:'var(--text2)'}},`${p.item.cantidad_comprada} / ${p.item.cantidad_total} uds`),
    ]),
    h('div',{style:{height:'4px',background:'var(--border)',borderRadius:'2px',marginBottom:'10px',overflow:'hidden'}},[
      h('div',{style:{height:'100%',width:pct.value+'%',background:p.item.completo?'var(--success)':'var(--accent)',borderRadius:'2px',transition:'width .3s'}})
    ]),
    ...(p.item.parciales||[]).map((parc,idx)=>h('div',{style:{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',gap:'8px',alignItems:'center',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'7px 10px',fontSize:'12px',marginBottom:'6px'}},[
      h('span',{style:{fontWeight:500}},parc.proveedor),
      h('span',{style:{fontFamily:"'DM Mono',monospace",color:'var(--text2)'}},`× ${parc.cantidad} uds`),
      h('span',{style:{fontFamily:"'DM Mono',monospace"}},fmt(parc.precio_unit)+' c/u'),
      h('span',{style:{color:'var(--text3)'}},fmtFecha(parc.fecha)),
      h('div',{style:{display:'flex',gap:'4px'}},[
        iconBtn('neutral', Pencil, ()=>emit('edit-parcial',{item:p.item,idx})),
        iconBtn('danger', Trash2, ()=>emit('delete-parcial',{itemId:p.item._id,idx})),
      ]),
    ])),
    !p.item.completo?h('button',{onClick:()=>emit('add-parcial'),style:{background:'transparent',border:'1px dashed var(--border)',borderRadius:'6px',color:'var(--text2)',fontSize:'12px',padding:'7px 12px',cursor:'pointer',fontFamily:"'Instrument Sans',sans-serif",width:'100%',marginTop:'4px'}},'+ Agregar compra parcial'):null,
  ])
}})
</script>
