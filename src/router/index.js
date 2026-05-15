import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
  { path: '/',           component: () => import('@/pages/HomePage.vue') },
  { path: '/dashboard',  component: () => import('@/pages/DashboardPage.vue'), meta: { adminOnly: true } },
  { path: '/cotizacion/:id', component: () => import('@/pages/CotizacionPage.vue') },
  { path: '/proveedores',      component: () => import('@/pages/ProveedoresPage.vue') },
  { path: '/logistica',        component: () => import('@/pages/LogisticaPage.vue') },
  { path: '/logistica/:id',    component: () => import('@/pages/LogisticaPage.vue') },
  { path: '/costos-fijos',     component: () => import('@/pages/CostosFijosPage.vue'), meta: { adminOnly: true } },
  { path: '/usuarios',         component: () => import('@/pages/UsuariosPage.vue'),    meta: { adminOnly: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if (to.meta.adminOnly && auth.user?.rol !== 'admin') return '/'
})

export default router
