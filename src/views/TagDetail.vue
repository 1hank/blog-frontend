<template>
  <div class="shell py-12 sm:py-14">
    <router-link
      to="/tags"
      class="label inline-flex items-center gap-1.5 transition-colors hover:text-accent"
    >
      ← 全部标签
    </router-link>

    <header class="mt-7" data-reveal>
      <div class="flex items-center gap-2.5">
        <span class="label label--accent">TAG</span>
        <span class="rule"></span>
        <span class="label">{{ list.length }} 篇</span>
      </div>
      <h1 class="display mt-3 text-4xl sm:text-6xl">
        <span class="text-accent">#</span>{{ tagName }}
      </h1>
    </header>

    <div v-if="list.length" class="mt-10" data-reveal-children>
      <ArticleRow
        v-for="(article, i) in list"
        :key="article.slug"
        :article="article"
        :index="padNumber(i + 1)"
      />
    </div>

    <div v-else class="mt-12 border border-line p-10 text-center" data-reveal>
      <p class="font-mono text-2xl text-muted">∅</p>
      <p class="mt-3 text-sm text-muted">还没有文章带上这个标签</p>
      <router-link to="/blog" class="btn btn--sm mt-5">看全部文章</router-link>
    </div>

    <section v-if="others.length" class="mt-14 border-t border-line pt-6">
      <p class="label">其他标签</p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <TagPill
          v-for="item in others"
          :key="item.name"
          :name="item.name"
          :count="item.count"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ArticleRow from "../components/ArticleRow.vue";
import TagPill from "../components/TagPill.vue";
import { articlesByTag, tags } from "../data/articles";
import { padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";

const route = useRoute();

const tagName = computed(() => {
  try {
    return decodeURIComponent(String(route.params.tag));
  } catch {
    return String(route.params.tag);
  }
});

const list = computed(() => articlesByTag(tagName.value));
const others = computed(() =>
  tags.filter((tag) => tag.name !== tagName.value).slice(0, 12)
);

usePageChrome();
</script>
