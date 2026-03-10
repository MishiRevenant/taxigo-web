import { ref } from 'vue'
import type { Toast, ToastType } from '@/types'

const toasts = ref<Toast[]>([])

let idCounter = 0

export function useToast() {
    function addToast(opts: {
        type: ToastType
        title: string
        message?: string
        duration?: number
    }) {
        const id = `toast-${++idCounter}`
        const toast: Toast = {
            id,
            type: opts.type,
            title: opts.title,
            message: opts.message,
            duration: opts.duration ?? 4000,
        }
        toasts.value.push(toast)

        if (toast.duration && toast.duration > 0) {
            setTimeout(() => removeToast(id), toast.duration)
        }

        return id
    }

    function removeToast(id: string) {
        const index = toasts.value.findIndex((t) => t.id === id)
        if (index > -1) toasts.value.splice(index, 1)
    }

    function clearAll() {
        toasts.value = []
    }

    return { toasts, addToast, removeToast, clearAll }
}
