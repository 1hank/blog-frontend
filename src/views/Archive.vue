<template>
  <div class="shell py-12 sm:py-14">
    <SectionHead
      en="ARCHIVE"
      title="归档"
      :description="`${articles.length} 篇,横跨 ${years.length} 年。按年月排开。`"
      large
      as="h1"
      data-reveal
    >
      <template #action>
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="btn btn--sm"
          @click="jumpTo(year)"
        >
          {{ year }}
        </button>
      </template>
    </SectionHead>

    <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4" data-reveal>
      <div
        v-for="item in summary"
        :key="item.label"
        class="rounded-2xl border border-line bg-soft px-4 py-4"
      >
        <dt class="label">{{ item.label }}</dt>
        <dd class="mt-1.5 text-2xl font-black tracking-tight">{{ item.value }}</dd>
      </div>
    </dl>

    <div class="mt-10">
      <Timeline :groups="groups" />
    </div>

    <div class="mt-12 flex items-center gap-3 border-t border-line pt-5" data-reveal>
      <router-link to="/tags" class="label transition-colors hover:text-accent">
        换个角度看:全部标签 →
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SectionHead from "../components/SectionHead.vue";
import Timeline from "../components/Timeline.vue";
import { articles, stats, categories } from "../data/articles";
import { groupByYear, groupByMonth, yearOf } from "../lib/format";
import { scrollToSelector } from "../lib/scroll";
import { usePageChrome } from "../composables/usePageChrome";

const groups = computed(() =>
  groupByYear(articles).map((group) => ({
    year: group.year,
    items: group.items,
    months: groupByMonth(group.items),
  }))
);

const years = computed(() =>
  Array.from(new Set(articles.map((article) => yearOf(article.date))))
);

const summary = computed(() => [
  { label: "文章", value: stats.posts },
  { label: "标签", value: stats.tags },
  { label: "分类", value: categories.length - 1 },
  { label: "字数", value: `${Math.round(stats.words / 1000)}k` },
]);

const jumpTo = (year) => scrollToSelector(`#year-${year}`, -80);

usePageChrome();
</script>
