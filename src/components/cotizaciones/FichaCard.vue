<template>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:16px">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--border)">
      <div style="font-family:'DM Serif Display',serif;font-size:18px;flex:1">{{ producto.desc || 'Sin nombre' }}</div>
      <div style="background:var(--accent-dim);color:var(--accent);border:1px solid rgba(201,168,76,.3);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600">
        × {{ producto.cantidad }} unid.
      </div>
    </div>

    <!-- Content -->
    <div style="display:grid;grid-template-columns:210px 1fr;gap:18px;align-items:start">
      <!-- Foto -->
      <div>
        <label :style="lblStyle">Fotografía</label>
        <div
          :style="photoZoneStyle"
          @click="editable && $refs.fileInput.click()"
        >
          <img v-if="producto.ficha?.foto_url" :src="producto.ficha.foto_url" style="width:100%;height:100%;object-fit:contain;display:block" />
          <template v-else>
            <div style="text-align:center;color:var(--text3)">
              <div style="font-size:26px;margin-bottom:8px">+</div>
              <div style="font-size:11px;line-height:1.5">Click para subir<br>desde el escritorio</div>
            </div>
          </template>
          <button v-if="producto.ficha?.foto_url && editable" @click.stop="clearPhoto" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:4px;padding:3px 8px;font-size:10px;cursor:pointer">
            × quitar
          </button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFile" />
        <button v-if="producto.ficha?.foto_url && editable" @click="clearPhoto" style="margin-top:6px;font-size:11px;color:var(--text3);background:none;border:none;cursor:pointer;font-family:'Instrument Sans',sans-serif">
          × Eliminar foto
        </button>

        <div v-if="editable" style="display:flex;align-items:center;gap:8px;margin:10px 0 6px;color:var(--text3);font-size:10px;text-transform:uppercase;letter-spacing:.08em">
          <div style="flex:1;height:1px;background:var(--border)"/> o pega URL <div style="flex:1;height:1px;background:var(--border)"/>
        </div>
        <div v-if="editable" style="display:flex;gap:6px">
          <input
            v-model="urlInput"
            type="url" placeholder="https://..."
            @keydown.enter="applyUrl"
            style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-family:'DM Mono',monospace;font-size:11px;outline:none"
          />
          <button @click="applyUrl" :style="applyBtnStyle"
            @mouseenter="e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}"
            @mouseleave="e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)'}"
          >Aplicar</button>
        </div>
      </div>

      <!-- Descripción -->
      <div>
        <label :style="lblStyle">Descripción del producto</label>
        <textarea
          :value="producto.ficha?.descripcion"
          :disabled="!editable"
          @input="$emit('update-ficha', 'descripcion', $event.target.value)"
          placeholder="Características técnicas, especificaciones, material, dimensiones, etc."
          style="width:100%;height:160px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text);font-family:'Instrument Sans',sans-serif;font-size:13px;outline:none;resize:vertical;line-height:1.6"
        />
        <div style="font-size:11px;color:var(--text3);margin-top:6px">
          Incluye especificaciones, material, dimensiones, garantía, etc.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({ producto: Object, editable: Boolean })
const emit  = defineEmits(['update-ficha'])
const toast = useToast()
const fileInput = ref(null)
const urlInput  = ref(props.producto?.ficha?.foto_url || '')

function handleFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => emit('update-ficha', 'foto_url', ev.target.result)
  reader.readAsDataURL(file)
}

function applyUrl() {
  const url = urlInput.value.trim()
  if (!url) return
  const img = new Image()
  img.onload  = () => emit('update-ficha', 'foto_url', url)
  img.onerror = () => toast.error('No se pudo cargar la imagen desde esa URL')
  img.src = url
}

function clearPhoto() {
  emit('update-ficha', 'foto_url', '')
  urlInput.value = ''
}

const lblStyle = { display:'block', fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)', fontWeight:600, marginBottom:'5px' }
const photoZoneStyle = {
  border: props.producto?.ficha?.foto_url ? '2px solid var(--border2)' : '2px dashed var(--border)',
  borderRadius:'8px', height:'170px', display:'flex', alignItems:'center', justifyContent:'center',
  overflow:'hidden', background:'var(--surface2)', position:'relative',
  cursor: props.editable ? 'pointer' : 'default',
}
const applyBtnStyle = { background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text2)', borderRadius:'6px', padding:'7px 11px', fontSize:'12px', cursor:'pointer', fontFamily:"'Instrument Sans',sans-serif", transition:'all .15s', flexShrink:0 }
</script>
