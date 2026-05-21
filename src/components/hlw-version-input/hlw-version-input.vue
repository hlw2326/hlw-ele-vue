<template>
    <div
        class="hlw-version-input"
        :class="[
            { 'is-disabled': disabled, 'is-error': inputStatus === 'error' },
            `size-${size || 'medium'}`,
            { 'is-fit': fit }
        ]"
        :style="inputStyle"
        @click="focusFirst"
    >
        <template v-for="(_, index) in segments" :key="index">
            <input
                :ref="setInputRef(index)"
                class="version-segment"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                :value="segments[index]"
                :placeholder="placeholders[index]"
                :disabled="disabled"
                @input="input(index, $event)"
                @keydown="keydown(index, $event)"
                @focus="select"
                @click="select"
                @blur="blur"
            >
            <span v-if="index < 2" class="version-dot">.</span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { CSSProperties, VNodeRef } from 'vue'

const SEGMENT_LENGTHS = [1, 1, 2]
const VERSION_PATTERN = /^\d\.\d\.\d{1,2}$/

const props = withDefaults(
    defineProps<{
        value?: string
        placeholder?: string
        clearable?: boolean
        disabled?: boolean
        size?: 'tiny' | 'small' | 'medium' | 'large'
        status?: 'success' | 'warning' | 'error'
        fit?: boolean
        showFocusShadow?: boolean
        focusShadow?: string
        errorFocusShadow?: string
    }>(),
    {
        value: '',
        placeholder: '1.0.0',
        clearable: true,
        disabled: false,
        size: undefined,
        status: undefined,
        fit: false,
        showFocusShadow: false,
        focusShadow: undefined,
        errorFocusShadow: undefined
    }
)
const emit = defineEmits<{
    'update:value': [value: string]
    blur: [event: FocusEvent]
}>()
const touched = ref(false)
const inputRefs = ref<Array<HTMLInputElement | null>>([])

const segments = computed(() => splitValue(props.value))
const placeholders = computed(() => splitValue(props.placeholder))
const inputStyle = computed<CSSProperties>(() => {
    const inputTheme = {
        boxShadowFocus: 'none',
        boxShadowFocusError: 'none'
    }
    const focusShadow = props.showFocusShadow
        ? props.focusShadow || themeValue(inputTheme.boxShadowFocus) || '0 0 0 2px rgba(37, 99, 235, 0.12)'
        : 'none'
    const errorFocusShadow = props.showFocusShadow
        ? props.errorFocusShadow || themeValue(inputTheme.boxShadowFocusError) || '0 0 0 2px rgba(208, 48, 80, 0.12)'
        : 'none'

    return {
        '--hlw-version-focus-shadow': focusShadow,
        '--hlw-version-error-focus-shadow': errorFocusShadow
    }
})

const inputStatus = computed(() => {
    if (props.status) return props.status
    if (!touched.value || !props.value) return undefined
    return VERSION_PATTERN.test(props.value) ? undefined : 'error'
})

function setInputRef(index: number): VNodeRef {
    return (el) => {
        inputRefs.value[index] = el instanceof HTMLInputElement ? el : null
    }
}

function themeValue(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
}

function splitValue(value = ''): string[] {
    const parts = value.split('.')
    return [0, 1, 2].map((index) =>
        (parts[index] || '').replace(/\D/g, '').slice(0, SEGMENT_LENGTHS[index])
    )
}

function focus(index: number): void {
    if (index < 0 || index > 2) return
    const input = inputRefs.value[index]
    if (!input) return
    input.focus()
    input.select()
}

function focusFirst(event: MouseEvent): void {
    if (event.target instanceof HTMLInputElement) return
    focus(0)
}

function joinValue(parts: string[]): string {
    return parts.join('.')
}

function distribute(index: number, value: string, parts: string[]): { data: string[]; nextIndex: number } {
    const data = [...parts]
    if (value.includes('.')) {
        const rawParts = value.split('.')
        rawParts.forEach((part, offset) => {
            const target = index + offset
            if (target <= 2) data[target] = part.replace(/\D/g, '').slice(0, SEGMENT_LENGTHS[target])
        })
        return { data, nextIndex: Math.min(index + rawParts.length, 2) }
    }

    let target = index
    let digits = value.replace(/\D/g, '')
    if (index === 2) {
        data[index] = digits.slice(-SEGMENT_LENGTHS[index])
        return { data, nextIndex: index }
    }

    while (digits && target < 3) {
        const limit = SEGMENT_LENGTHS[target]
        data[target] = digits.slice(0, limit)
        digits = digits.slice(limit)
        if (data[target].length >= limit) target += 1
    }

    return { data, nextIndex: Math.min(target, 2) }
}

function input(index: number, event: Event): void {
    touched.value = false
    const target = event.target as HTMLInputElement
    const inputEvent = event as InputEvent
    const value =
        index < 2 && inputEvent.data && /^\d$/.test(inputEvent.data)
            ? inputEvent.data
            : target.value
    const { data, nextIndex } = distribute(index, value, segments.value)
    target.value = data[index]
    emit('update:value', joinValue(data))
    if (nextIndex !== index) nextTick(() => focus(nextIndex))
}

function keydown(index: number, event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement
    if ((event.key === '.' || event.key === 'Enter' || event.key === 'ArrowRight') && index < 2) {
        if (event.key !== 'ArrowRight' || target.selectionStart === target.value.length) {
            event.preventDefault()
            focus(index + 1)
        }
    }
    if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && index > 0) {
        if (target.selectionStart === 0 && target.selectionEnd === 0) focus(index - 1)
    }
}

function select(event: FocusEvent | MouseEvent): void {
    const target = event.target as HTMLInputElement
    target.select()
}

function blur(event: FocusEvent): void {
    touched.value = true
    emit('blur', event)
}
</script>

<style scoped>
.hlw-version-input {
    display: grid;
    align-items: center;
    grid-template-columns: minmax(26px, 1fr) 8px minmax(26px, 1fr) 8px minmax(34px, 1.35fr);
    gap: 0;
    box-sizing: border-box;
    width: 100%;
    height: 34px;
    border: 1px solid #dcdfe6;
    border-radius: 7px;
    background: #fff;
    padding: 0 9px;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
}

.hlw-version-input.is-fit {
    width: 142px;
}

.hlw-version-input:focus-within {
    border-color: var(--brand-500);
    box-shadow: var(--hlw-version-focus-shadow, none);
}

.hlw-version-input.is-error {
    border-color: #d03050;
}

.hlw-version-input.is-error:focus-within {
    box-shadow: var(--hlw-version-error-focus-shadow, none);
}

.hlw-version-input.is-disabled {
    background: var(--gray-50);
    color: var(--gray-400);
    cursor: not-allowed;
}

.version-segment {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    color: var(--gray-800);
    font-size: 14px;
    outline: none;
    padding: 0;
    text-align: center;
}

.size-small {
    height: 32px;
    padding: 0 8px;
}

.size-small .version-segment {
    font-size: 13px;
}

.size-large {
    height: 40px;
    padding: 0 11px;
}

.version-segment:disabled {
    background: transparent;
    color: var(--gray-400);
    cursor: not-allowed;
}

.version-dot {
    color: var(--gray-500);
    font-size: 16px;
    line-height: 1;
    text-align: center;
}

.is-disabled .version-dot {
    opacity: 0.55;
}
</style>
