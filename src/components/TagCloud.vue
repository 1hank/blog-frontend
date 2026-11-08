<template>
  <div class="flex flex-wrap items-baseline gap-x-4 gap-y-3">
    <router-link
      v-for="tag in tags"
      :key="tag.name"
      :to="`/tags/${encodeURIComponent(tag.name)}`"
      class="group inline-flex items-baseline gap-0.5 font-extrabold leading-none tracking-tight transition-colors"
      :style="{ fontSize: sizeOf(tag.count) }"
    >
      <span class="text-accent">#</span>
      <span class="text-ink/85 group-hover:text-accent">{{ tag.name }}</span>
      <span class="ml-1.5 font-mono text-xs font-medium tracking-wider text-muted">
        {{ tag.count }}
      </span>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tags: { type: Array, required: true },
});

const bounds = computed(() => {
  const counts = props.tags.map((tag) => tag.count);
  return { min: Math.min(...counts), max: Math.max(...counts) };
});

function sizeOf(count) {
  const { min, max } = bounds.value;
  const ratio = max === min ? 0.35 : (count - min) / (max - min);
  return `${0.95 + ratio * 1.15}rem`;
}
</script>
