<template>
    <n-drawer
        v-model:show="showValue"
        class="hlw-drawer"
        placement="right"
        :width="width"
        :mask-closable="maskClosable"
        @after-enter="emit('opened')"
        @after-leave="emit('closed')"
    >
        <n-drawer-content
            :native-scrollbar="false"
            :closable="false"
            :header-style="{ padding: 0 }"
            :body-content-style="{ padding: 0 }"
            :footer-style="{ padding: 0 }"
        >
            <template #header>
                <div class="hlw-drawer-head">
                    <div class="hlw-drawer-title">{{ title }}</div>
                </div>
            </template>

            <div class="hlw-drawer-body">
                <slot />
            </div>

            <template v-if="$slots.footer" #footer>
                <div class="hlw-drawer-foot">
                    <slot name="footer" />
                </div>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        show?: boolean
        title: string
        width?: number | string
        maskClosable?: boolean
    }>(),
    {
        width: 560,
        maskClosable: false
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
.hlw-drawer {
    --n-border-radius: 0 !important;
}

.n-drawer.hlw-drawer,
.n-drawer.hlw-drawer .n-drawer-content-wrapper,
.n-drawer.hlw-drawer .n-drawer-content,
.n-drawer.hlw-drawer .n-drawer-body-content-wrapper,
.hlw-drawer,
.hlw-drawer .n-drawer-content-wrapper,
.hlw-drawer .n-drawer-content,
.hlw-drawer .n-drawer-body-content-wrapper {
    border-radius: 0 !important;
    overflow: hidden;
}

.hlw-drawer .n-drawer-body-content-wrapper {
    display: flex;
    flex-direction: column;
    padding: 0;
}

.hlw-drawer .n-drawer-header,
.hlw-drawer .n-drawer-footer {
    padding: 0;
}

.hlw-drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 55px;
    padding: 0 18px;
    background: linear-gradient(180deg, #ffffff, #f7fbff);
}

.hlw-drawer-title {
    display: flex;
    align-items: center;
    margin: 0;
    color: var(--gray-900);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.04em;
}

.hlw-drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.hlw-drawer-foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    min-height: 58px;
    padding: 12px 16px;
    background: #fff;
}
</style>
