import api from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}

export const cotizacionService = {
  listar: (params = {}) => api.get('/cotizaciones', { params }).then(r => r.data),
  obtener: (id) => api.get(`/cotizaciones/${id}`).then(r => r.data),
  crear: (data) => api.post('/cotizaciones', data).then(r => r.data),
  actualizar: (id, data) => api.patch(`/cotizaciones/${id}`, data).then(r => r.data),
  cambiarEstado: (id, estado) => api.patch(`/cotizaciones/${id}/estado`, { estado }).then(r => r.data),
  eliminar: (id) => api.delete(`/cotizaciones/${id}`),
}

export const compraService = {
  obtenerPorCotizacion: (id) => api.get(`/compras/cotizacion/${id}`).then(r => r.data),
  agregarParcial: (itemId, parcial) => api.post(`/compras/items/${itemId}/parciales`, { parcial }).then(r => r.data),
  actualizarParcial: (itemId, idx, data) => api.patch(`/compras/items/${itemId}/parciales/${idx}`, data).then(r => r.data),
  eliminarParcial: (itemId, idx) => api.delete(`/compras/items/${itemId}/parciales/${idx}`),
}

export const documentoService = {
  listar: (cotizacionId) => api.get(`/documentos/cotizacion/${cotizacionId}`).then(r => r.data),
  subir: (cotizacionId, file, tipo, monto, numero_doc) => {
    const form = new FormData()
    form.append('file', file)
    form.append('tipo', tipo)
    if (monto) form.append('monto', monto)
    if (numero_doc) form.append('numero_doc', numero_doc)
    return api.post(`/documentos/cotizacion/${cotizacionId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
  eliminar: (docId) => api.delete(`/documentos/${docId}`),
}

export const usuarioService = {
  listar:     ()         => api.get('/usuarios').then(r => r.data),
  crear:      (data)     => api.post('/usuarios', data).then(r => r.data),
  actualizar: (id, data) => api.patch(`/usuarios/${id}`, data).then(r => r.data),
  eliminar:   (id)       => api.delete(`/usuarios/${id}`),
}

export const proveedorService = {
  listar:     ()         => api.get('/proveedores').then(r => r.data),
  obtener:    (id)       => api.get(`/proveedores/${id}`).then(r => r.data),
  crear:      (data)     => api.post('/proveedores', data).then(r => r.data),
  actualizar: (id, data) => api.patch(`/proveedores/${id}`, data).then(r => r.data),
  eliminar:   (id)       => api.delete(`/proveedores/${id}`),
}

export const costoFijoService = {
  listar: () => api.get('/costos-fijos').then(r => r.data),
  crear: (data) => api.post('/costos-fijos', data).then(r => r.data),
  actualizar: (id, data) => api.patch(`/costos-fijos/${id}`, data).then(r => r.data),
  eliminar: (id) => api.delete(`/costos-fijos/${id}`),
}
