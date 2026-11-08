<template>
  <router-link :to="`/blog/${article.slug}`" class="row group h-full">
    <div class="flex items-center justify-between gap-3">
      <span class="row__index">{{ index }}</span>
      <time class="index" :datetime="article.date">{{ formatDate(article.date) }}</time>
    </div>

    <h3 class="row__title mt-2">{{ article.title }}</h3>

    <p class="row__excerpt mt-1.5">{{ article.excerpt }}</p>

    <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
      <span class="label label--accent mr-1">{{ article.category }}</span>
      <span
        v-for="tag in article.tags"
        :key="tag"
        class="tag"
        @click.prevent.stop="goTag(tag)"
      >
        #{{ tag }}
      </span>
      <span
        class="label ml-auto opacity-0 transition-opacity group-hover:opacity-100"
      >
        阅读 →
      </span>
    </div>
  </router-link>
</template>

<script setup>
import { useRouter } from "vue-router";
import { formatDate } from "../lib/format";

defineProps({
  article: { type: Object, required: true },
  index: { type: String, default: "01" },
});

const router = useRouter();
const goTag = (tag) => router.push(`/tags/${encodeURIComponent(tag)}`);
</script>
