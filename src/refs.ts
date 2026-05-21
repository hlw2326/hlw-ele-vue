import { onBeforeUpdate, onUnmounted, ref } from 'vue'

export function useRefs<T = unknown>() {
    const refs = ref({} as Record<string, T>)

    function clear(): void {
        refs.value = {}
    }

    function setRefs(key: string | number) {
        return (el: unknown) => {
            if (el) refs.value[String(key)] = el as T
        }
    }

    onBeforeUpdate(clear)
    onUnmounted(clear)

    return { refs, setRefs }
}
