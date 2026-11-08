<template>
  <component
    :is="note.article ? 'router-link' : 'div'"
    :to="note.article ? `/blog/${note.article}` : undefined"
    class="group block h-full"
  >
    <div class="card h-full p-5">
      <div class="flex items-center justify-between gap-3">
        <span class="flex items-center gap-2">
          <span class="text-base leading-none">{{ note.emoji }}</span>
          <span class="label label--accent">{{ note.tag }}</span>
        </span>
        <time class="index" :datetime="note.date">{{ formatMonthDay(note.date) }}</time>
      </div>

      <p
        class="mt-3 text-sm leading-relaxed text-muted transition-colors group-hover:text-ink/90"
      >
        {{ note.text }}
      </p>

      <p
        v-if="note.article"
        class="label mt-4 opacity-0 transition-opacity group-hover:opacity-100"
      >
        相关文章 →
      </p>
    </div>
  </component>
</template>

<script setup>
import { formatMonthDay } from "../lib/format";

defineProps({
  note: { type: Object, required: true },
});
</script>
