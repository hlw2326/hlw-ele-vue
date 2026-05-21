<template>
    <n-modal
        v-model:show="showValue"
        preset="card"
        class="hlw-modal"
        :style="{ width }"
        :bordered="false"
        draggable
        @after-enter="emit('opened')"
        @after-leave="emit('closed')"
    >
        <template #header>
            <div class="dialog-title">
                <span>{{ title }}</span>
            </div>
        </template>

        <slot />

        <template #footer>
            <slot name="footer" />
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        show?: boolean
        title: string
        width?: string
    }>(),
    {
        width: '560px'
    }
)
const emit = defineEmits<{
    'update:show': [value: boolean]
    open: []
    opened: []
    close: []
    closed: []
}>()
const visible = ref(false)
const showValue = computed({
    get: () => props.show ?? visible.value,
    set: (value: boolean) => {
        visible.value = value
        emit('update:show', value)
    }
})

watch(showValue, (value) => {
    if (value) emit('open')
    else emit('close')
})

function open(): void {
    showValue.value = true
}

function close(): void {
    showValue.value = false
}

defineExpose({ open, close })
</script>

<style>
.hlw-modal {
    border-radius: 10px;
}

.hlw-modal .n-card-header {
    position: relative;
    margin-right: 0;
    padding: 10px 14px;
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
}

.hlw-modal .n-card-header__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.hlw-modal .n-card__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 14px;
    border-top: 1px solid var(--gray-200);
    background: var(--gray-50);
}

.hlw-modal .dialog-title {
    display: flex;
    align-items: center;
    color: var(--gray-900);
    cursor: move;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.04em;
}
</style>
