import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const title = ref('Confirm Delete')
let resolveRef: ((v: boolean) => void) | null = null

export function useConfirm() {
  function confirm(msg: string, ttl = 'Confirm Delete'): Promise<boolean> {
    message.value = msg
    title.value = ttl
    visible.value = true
    return new Promise(resolve => { resolveRef = resolve })
  }

  function answer(v: boolean) {
    resolveRef?.(v)
    resolveRef = null
    visible.value = false
  }

  return { visible, message, title, confirm, answer }
}
