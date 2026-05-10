# Abastecimiento Total — Frontend (Vue 3)

Frontend en Vue 3 + Vite para el sistema de cotizaciones.

## Stack
- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4**
- **Pinia** (estado global: auth)
- **TanStack Vue Query** (fetching, caché, invalidación)
- **Axios** (HTTP con interceptors JWT)
- **Vite** (dev server con proxy al backend)
- **lucide-vue-next** (íconos)
- **date-fns** (fechas en español)

## Instalación y ejecución

```bash
cd abastecimiento-frontend

# Instalar dependencias
npm install

# Levantar en desarrollo (requiere backend en :8000)
npm run dev
```

Frontend disponible en: **http://localhost:5173**

El proxy de Vite redirige `/api/*` → `http://localhost:8000` automáticamente.

## Credenciales iniciales

| Usuario           | Email                                | Contraseña |
|-------------------|--------------------------------------|------------|
| Gonzalo Galvez    | ggalvezb@abastecimientototal.cl      | at2025     |
| Joel Caceres      | jcaceresf@abastecimientototal.cl     | at2025     |
| Gabriela Soto     | gsotov@abastecimientototal.cl        | at2025     |
| Felipe Valdenegro | fvaldenegro@abastecimientototal.cl   | at2025     |

O usa los botones de acceso rápido en el login.

## Estructura

```
src/
├── components/
│   ├── layout/
│   │   └── AppShell.vue          # Topbar + navegación
│   ├── ui/
│   │   ├── AppBadge.vue          # Badge de estado
│   │   ├── AppBtn.vue            # Botón con variantes
│   │   ├── AppInput.vue          # Input con label
│   │   ├── AppModal.vue          # Modal con Teleport
│   │   └── AppSpinner.vue        # Spinner de carga
│   └── cotizaciones/
│       └── FichaCard.vue         # Card de ficha técnica
├── pages/
│   ├── LoginPage.vue
│   ├── HomePage.vue
│   ├── CotizacionPage.vue
│   └── LogisticaPage.vue
├── composables/
│   └── useToast.js               # Sistema de notificaciones
├── services/
│   ├── api.js                    # Axios con interceptors
│   └── index.js                  # Funciones por recurso
├── stores/
│   └── auth.js                   # Pinia: login/logout/token
├── lib/
│   └── utils.js                  # fmt, calcular, ESTADOS, etc.
├── router/
│   └── index.js                  # Vue Router + guard auth
├── App.vue                       # Root + toast renderer
├── main.js                       # Entrypoint
└── index.css                     # Design tokens CSS
```
