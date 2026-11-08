<template>
  <div v-if="info" class="border border-line bg-soft p-4">
    <div class="flex items-center justify-between gap-3">
      <span class="label label--accent">系列 · {{ info.name }}</span>
      <span class="index">{{ info.index }} / {{ info.total }}</span>
    </div>

    <div class="mt-3 h-[2px] w-full bg-line">
      <div
        class="h-full bg-accent transition-all duration-700"
        :style="{ width: `${(info.index / info.total) * 100}%` }"
      ></div>
    </div>

    <ol class="mt-3 space-y-1.5">
      <li v-for="post in siblings" :key="post.slug">
        <router-link
          :to="`/blog/${post.slug}`"
          class="flex items-baseline gap-2 text-xs leading-relaxed transition-colors"
          :class="
            post.slug === article.slug ? 'text-accent' : 'text-muted hover:text-ink'
          "
        >
          <span class="index shrink-0">{{ post.series.index }}</span>
          <span>{{ post.title }}</span>
        </router-link>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { series } from "../data/articles";

const props = defineProps({
  article: { type: Object, required: true },
});

const info = computed(() => props.article.series || null);

const siblings = computed(() => {
  if (!info.value) return [];
  const group = series.find((item) => item.name === info.value.name);
  return group?.articles || [];
});
</script>
