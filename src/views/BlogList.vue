<template>
  <div class="shell py-12 sm:py-16">
    <SectionHead
      en="articles"
      title="全部文章"
      :description="`共 ${articles.length} 篇,持续更新中。按主题筛一筛,或者直接往下翻。`"
      large
      as="h1"
      data-reveal
    >
      <template #aside>
        <span class="label">{{ filtered.length }} 篇</span>
      </template>
    </SectionHead>

    <div class="mt-6 flex flex-wrap gap-2" data-reveal>
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        class="btn btn--sm"
        :class="activeCategory === category ? 'btn--accent' : ''"
        @click="activeCategory = category"
      >
        {{ category }}
        <span class="opacity-60">{{ countOf(category) }}</span>
      </button>
    </div>

    <div v-if="groups.length" class="mt-12 space-y-12">
      <section v-for="group in groups" :key="group.year">
        <div class="mb-4 flex items-baseline gap-3" data-reveal>
          <h2 class="text-xl font-black tracking-tight">{{ group.year }}</h2>
          <span class="label">{{ group.items.length }} 篇</span>
          <span class="rule"></span>
        </div>

        <div class="grid gap-4 sm:grid-cols-2" data-reveal-children>
          <ArticleRow
            v-for="(article, i) in group.items"
            :key="article.slug"
            :article="article"
            :index="padNumber(i + 1)"
          />
        </div>
      </section>
    </div>

    <div
      v-else
      class="mt-16 rounded-2xl border border-line bg-soft p-10 text-center"
      data-reveal
    >
      <p class="text-2xl">🗂️</p>
      <p class="mt-3 text-sm text-muted">「{{ activeCategory }}」下还没有文章</p>
      <button type="button" class="btn btn--sm mt-5" @click="activeCategory = '全部'">
        看全部
      </button>
    </div>

    <div class="mt-14 flex flex-wrap items-center gap-3" data-reveal>
      <span class="rule"></span>
      <button
        type="button"
        class="label transition-colors hover:text-accent"
        @click="openSearch"
      >
        找不到?试试 ⌘K 搜索
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SectionHead from "../components/SectionHead.vue";
import ArticleRow from "../components/ArticleRow.vue";
import { articles, categories, articlesByCategory } from "../data/articles";
import { groupByYear, padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";
import { useSearch } from "../composables/useSearch";

const activeCategory = ref("全部");
const { openSearch } = useSearch();

const filtered = computed(() => articlesByCategory(activeCategory.value));
const groups = computed(() => groupByYear(filtered.value));

const countOf = (category) => articlesByCategory(category).length;

usePageChrome();
</script>
