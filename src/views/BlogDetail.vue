<template>
  <div>
    <ReadingProgress v-if="article" />

    <div v-if="article" class="shell py-10 sm:py-12">
      <router-link
        to="/blog"
        class="label inline-flex items-center gap-1.5 transition-colors hover:text-accent"
      >
        ← 返回文章
      </router-link>

      <header class="mt-7 max-w-3xl">
        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span class="label label--accent">{{ article.category }}</span>
          <span class="label text-line">/</span>
          <time class="index" :datetime="article.date">{{ formatDate(article.date) }}</time>
          <span class="label text-line">/</span>
          <span class="index">{{ article.readingTime }} MIN</span>
        </div>

        <h1 class="display mt-4 text-3xl leading-tight sm:text-[2.6rem]">
          {{ article.title }}
        </h1>

        <p class="mt-4 text-base leading-relaxed text-muted">{{ article.excerpt }}</p>

        <div class="mt-5 flex flex-wrap gap-1.5">
          <TagPill v-for="tag in article.tags" :key="tag" :name="tag" />
        </div>

        <div v-if="article.series" class="mt-7">
          <SeriesBanner :article="article" />
        </div>

        <details
          v-if="headings.length"
          class="mt-6 rounded-xl border border-line bg-soft px-4 py-3 lg:hidden"
        >
          <summary class="label cursor-pointer">目录 · {{ tocHeadings.length }} 节</summary>
          <div class="mt-3">
            <TocNav :headings="headings" />
          </div>
        </details>
      </header>

      <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_218px]">
        <div class="min-w-0">
          <MarkdownBody :html="html" />

          <div class="mt-12 flex flex-wrap items-center gap-3">
            <span class="rule"></span>
            <span class="label">写于 {{ formatDate(article.date) }}</span>
          </div>
        </div>

        <aside class="hidden lg:block">
          <div class="sticky top-20 space-y-5">
            <TocNav v-if="headings.length" :headings="headings" />

            <div class="border-t border-line pt-4">
              <button type="button" class="btn btn--sm w-full justify-center" @click="copyLink">
                {{ copied ? "已复制 ✓" : "复制链接" }}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- 上下篇 -->
      <nav class="mt-14 grid gap-3 border-t border-line pt-7 sm:grid-cols-2">
        <router-link
          v-if="prev"
          :to="`/blog/${prev.slug}`"
          class="group rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ink/30"
        >
          <p class="label">← 上一篇</p>
          <p class="mt-2 text-sm font-semibold leading-snug transition-colors group-hover:text-accent">
            {{ prev.title }}
          </p>
        </router-link>
        <div v-else class="hidden sm:block"></div>

        <router-link
          v-if="next"
          :to="`/blog/${next.slug}`"
          class="group rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ink/30 sm:text-right"
        >
          <p class="label">下一篇 →</p>
          <p class="mt-2 text-sm font-semibold leading-snug transition-colors group-hover:text-accent">
            {{ next.title }}
          </p>
        </router-link>
      </nav>

      <!-- 相关 -->
      <section v-if="related.length" class="mt-12">
        <div class="mb-3 flex items-baseline gap-3">
          <h2 class="text-lg font-black tracking-tight">相关文章</h2>
          <span class="rule"></span>
        </div>
        <ArticleRow
          v-for="(item, i) in related"
          :key="item.slug"
          :article="item"
          :index="padNumber(i + 1)"
        />
      </section>

      <!-- 评论 -->
      <div class="mt-12">
        <CommentsPanel
          :storage-key="`article:${article.slug}`"
          title="评论"
          hint="纯前端演示:内容保存在浏览器本地,刷新还在,但别人看不到。"
          :seed="seedComments"
        />
      </div>
    </div>

    <div v-else class="shell py-24 text-center">
      <p class="text-3xl">🕳️</p>
      <h1 class="mt-4 text-lg font-semibold">这篇文章不存在</h1>
      <p class="mt-2 text-sm text-muted">它可能被删掉了,或者链接拼错了。</p>
      <div class="mt-6 flex flex-wrap justify-center gap-2.5">
        <router-link to="/blog" class="btn btn--sm">回到文章列表</router-link>
        <button type="button" class="btn btn--sm" @click="openSearch">搜索</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { getArticle, adjacentArticles, relatedArticles } from "../data/articles";
import { seedComments } from "../data/comments";
import { renderMarkdown } from "../lib/markdown";
import { formatDate, padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";
import { useSearch } from "../composables/useSearch";

import ReadingProgress from "../components/ReadingProgress.vue";
import MarkdownBody from "../components/MarkdownBody.vue";
import TocNav from "../components/TocNav.vue";
import TagPill from "../components/TagPill.vue";
import SeriesBanner from "../components/SeriesBanner.vue";
import CommentsPanel from "../components/CommentsPanel.vue";
import ArticleRow from "../components/ArticleRow.vue";

const route = useRoute();
const copied = ref(false);
const { openSearch } = useSearch();

const article = computed(() => getArticle(String(route.params.slug)));

const parsed = computed(() =>
  article.value ? renderMarkdown(article.value.content) : { html: "", headings: [] }
);

const html = computed(() => parsed.value.html);
const headings = computed(() => parsed.value.headings);
const tocHeadings = computed(() =>
  headings.value.filter((heading) => heading.level <= 3)
);

const prev = computed(() => adjacentArticles(article.value?.slug).prev);
const next = computed(() => adjacentArticles(article.value?.slug).next);
const related = computed(() => relatedArticles(article.value));

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1800);
  } catch {
    copied.value = false;
  }
}

usePageChrome();
</script>
