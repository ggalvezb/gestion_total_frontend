import axios from 'axios'
import { useToast } from '@/composables/useToast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('at_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const detail = err.response?.data?.detail
    const { error } = useToast()

    if (status === 401) {
      localStorage.removeItem('at_token')
      localStorage.removeItem('at_user')
      window.location.href = '/login'
      return Promise.reject(err)
    }
    if (status === 400) error(detail || 'Solicitud inválida')
    else if (status === 403) error('No tienes permisos para esta acción')
    else if (status === 404) error('Recurso no encontrado')
    else if (status >= 500) error('Error del servidor. Intenta nuevamente.')

    return Promise.reject(err)
  }
)

export default api
