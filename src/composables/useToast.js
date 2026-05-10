import { ref } from 'vue'

const toasts = ref([])
let id = 0

function addToast(message, type = 'default') {
  const toast = { id: ++id, message, type }
  toasts.value.push(toast)
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== toast.id)
  }, 3500)
}

export function useToast() {
  return {
    toasts,
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  }
}
