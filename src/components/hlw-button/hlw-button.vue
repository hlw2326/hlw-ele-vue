<template>
    <n-button v-bind="$attrs">
        <template v-if="icon" #icon>
            <component :is="icon" :size="iconSize" />
        </template>
        <slot />
    </n-button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ inheritAttrs: false })

withDefaults(
    defineProps<{
        icon?: Component
        iconSize?: number
    }>(),
    {
        icon: undefined,
        iconSize: 16
    }
)
</script>
