<template>
  <router-link :to="`/projects/${project.slug}`" class="group block h-full">
    <article class="card flex h-full flex-col">
      <div class="cover relative aspect-[16/10]" :class="coverClass">
        <span class="cover__mark"></span>
        <span class="cover__num">{{ number }}</span>
        <span class="label absolute left-4 top-3 text-white/75">
          {{ project.status }}
        </span>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <div class="flex items-center justify-between gap-3">
          <span class="label label--accent">{{ project.year }}</span>
          <span class="index">{{ project.stack.length }} 项技术</span>
        </div>

        <h3
          class="mt-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-accent"
        >
          {{ project.title }}
        </h3>
        <p class="label mt-1 normal-case tracking-normal">{{ project.subtitle }}</p>

        <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
          {{ project.desc }}
        </p>

        <div class="mt-auto flex flex-wrap gap-1.5 pt-4">
          <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </article>
  </router-link>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  project: { type: Object, required: true },
  number: { type: String, default: "01" },
});

const COVERS = ["cover--a", "cover--b", "cover--c", "cover--d", "cover--e", "cover--f"];

const coverClass = computed(() => {
  const seed = [...String(props.project.slug)].reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  return COVERS[seed % COVERS.length];
});
</script>
