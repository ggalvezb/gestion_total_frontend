import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const fmt  = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL')
export const fmtN = (n) => Math.round(n || 0).toLocaleString('es-CL')

export const fmtFecha = (iso) => {
  try {
    return format(typeof iso === 'string' ? parseISO(iso) : iso, "d MMM yyyy", { locale: es })
  } catch { return '—' }
}

const IVA_FACTOR = 1.19
export const calcular = (productos, parametros, costosFijosTotal = 0) => {
  const pctFijo    = (parametros.pct_costo_fijo  || 0) / 100
  const pctUtil    = (parametros.pct_utilidad     || 0) / 100
  const transporte =  parametros.costo_transporte || 0

  const valorCompra      = productos.reduce((s, p) => s + p.cantidad * p.precio_compra, 0)
  const ivaDebito        = valorCompra - valorCompra / IVA_FACTOR
  const costoFijoMonto   = costosFijosTotal * pctFijo
  const precioCostoFinal = (valorCompra / IVA_FACTOR) + costoFijoMonto + transporte
  const netoVenta        = precioCostoFinal * (1 + pctUtil)
  const ivaCredito       = netoVenta * 0.19
  const utilidadMonto    = netoVenta - precioCostoFinal

  return {
    valor_compra:       Math.round(valorCompra),
    iva_debito:         Math.round(ivaDebito),
    costo_fijo_monto:   Math.round(costoFijoMonto),
    precio_costo_final: Math.round(precioCostoFinal),
    utilidad_monto:     Math.round(utilidadMonto),
    neto_venta:         Math.round(netoVenta),
    iva_credito:        Math.round(ivaCredito),
    precio_venta_total: Math.round(netoVenta + ivaCredito),
  }
}

export const ESTADOS = {
  borrador:   { label: 'Borrador',   color: 'draft'    },
  enviada:    { label: 'Enviada',    color: 'sent'     },
  aprobada:   { label: 'Aprobada',   color: 'approved' },
  en_compra:  { label: 'En compra',  color: 'buying'   },
  comprada:   { label: 'Completada', color: 'done'     },
  despachado: { label: 'Despachado', color: 'shipped'  },
  rechazada:  { label: 'Rechazada',  color: 'rejected' },
  expirada:   { label: 'Expirada',   color: 'draft'    },
}

export const TRANSICIONES = {
  borrador:   ['enviada', 'rechazada'],
  enviada:    ['aprobada', 'rechazada', 'expirada'],
  aprobada:   ['en_compra', 'rechazada'],
  en_compra:  [],
  comprada:   ['despachado'],
  despachado: [],
  rechazada:  ['borrador'],
  expirada:   ['borrador'],
}

export const TIPOS_DOC = {
  factura_compra:   { label: 'Factura de compra',  grupo: 'compra' },
  boleta_compra:    { label: 'Boleta de compra',   grupo: 'compra' },
  orden_de_compra:  { label: 'Orden de compra',    grupo: 'venta'  },
  guia_despacho:    { label: 'Guía de despacho',   grupo: 'venta'  },
  factura_venta:    { label: 'Factura de venta',   grupo: 'venta'  },
  factura_despacho: { label: 'Factura despacho',   grupo: 'venta'  },
}

export const VENTA_TIPOS = ['orden_de_compra', 'guia_despacho', 'factura_venta', 'factura_despacho']

export const generarNumero = () => `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`
