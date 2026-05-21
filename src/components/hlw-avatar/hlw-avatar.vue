<template>
    <n-avatar
        class="hlw-avatar"
        :size="size"
        :src="src || undefined"
        :img-props="{ alt: name }"
        :round="false"
    >
        {{ initials }}
    </n-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        src?: string
        name?: string
        size?: number
    }>(),
    {
        src: '',
        name: '',
        size: 44
    }
)

const initials = computed(() => props.name.replace(/\s/g, '').slice(0, 2))
</script>

<style scoped>
.hlw-avatar {
    flex-shrink: 0;
    border: 1px solid #e5edf8;
    border-radius: 10px;
    color: #2361e8;
    background: #dbeafe;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.06em;
}

.hlw-avatar :deep(img) {
    object-fit: cover;
}

</style>
