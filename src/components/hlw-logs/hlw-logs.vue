<template>
  <div class="log-dialog-body">
    <n-empty v-if="logs.length === 0" class="log-empty" description="暂无任务日志" />
    <n-scrollbar
      v-else
      :ref="setRefs('scrollbar')"
      class="log-scrollbar"
      trigger="hover"
    >
      <div class="log-list">
        <div
          v-for="(log, index) in logs"
          :key="`${log.taskId}-${index}`"
          :class="['log-item', `log-item-${log.level}`]"
        >
          <div class="log-meta">
            <span>{{ formatTime(log.createdAt) }}</span>
            <span>{{ log.mpName }}</span>
            <em>{{ log.source }}</em>
          </div>
          <div class="log-message" :title="log.message">{{ log.message }}</div>
        </div>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch } from "vue";
import { useRefs } from "../../refs";

const props = defineProps<{
  logs: ILog.Item[];
}>();
const { refs, setRefs } = useRefs<any>();

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString();
}

function scrollToBottom(): void {
  void nextTick(() => {
    refs.value.scrollbar?.scrollTo({ position: "bottom" });
  });
}

watch(() => props.logs.length, scrollToBottom, { flush: "post" });
</script>

<style scoped>
.log-dialog-body {
  padding: 0;
}

.log-empty {
  padding: 48px 0;
}

.log-scrollbar {
  height: 520px;
}

.log-list {
  padding: 8px 16px 10px;
  background: #fbfdff;
}

.log-item {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid #edf2f8;
}

.log-meta {
  display: flex;
  align-items: center;
  min-width: 0;
  color: var(--gray-500);
  font-size: 12px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.log-meta span + span,
.log-meta em {
  margin-left: 8px;
}

.log-meta em {
  font-style: normal;
}

.log-message {
  overflow: hidden;
  min-width: 0;
  color: var(--gray-800);
  font-size: 13px;
  line-height: 1.45;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-item-success .log-message {
  color: #047857;
}

.log-item-error .log-message {
  color: var(--red-600);
}

.log-item-warning .log-message {
  color: #a16207;
}
</style>
