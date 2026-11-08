<template>
  <router-link
    :to="`/tags/${encodeURIComponent(name)}`"
    class="tag"
    :title="count !== undefined ? `${name} · ${count} 篇` : name"
  >
    <span class="text-accent">#</span>{{ name }}
    <span v-if="count !== undefined" class="ml-0.5 text-[0.9em] text-muted/70">
      {{ count }}
    </span>
  </router-link>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  count: { type: Number, default: undefined },
});
</script>
