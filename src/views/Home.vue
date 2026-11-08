<template>
  <div>
    <!-- Hero -->
    <section ref="heroRef" class="relative overflow-hidden">
      <HeroField />
      <div class="shell relative pb-14 pt-16 sm:pb-20 sm:pt-24">
        <p class="label label--accent" data-hero-item>
          // {{ site.role }} — $ whoami
        </p>

        <h1
          class="display mt-6 uppercase text-[2.6rem] sm:text-6xl lg:text-7xl"
          data-hero-item
        >
          你好,我是<br />
          <span class="text-accent">{{ site.name }}</span>
        </h1>

        <p class="mt-7 max-w-xl leading-relaxed text-muted" data-hero-item>
          {{ site.intro }}
        </p>

        <div class="mt-9 flex flex-wrap gap-3" data-hero-item>
          <router-link to="/blog" class="btn btn--accent">
            开始阅读 <span class="btn__arrow">→</span>
          </router-link>
          <router-link to="/about" class="btn">关于我</router-link>
        </div>

        <div class="mt-10 flex items-center gap-2.5 text-xs text-muted" data-hero-item>
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          {{ site.status.label }} · {{ site.status.text }}
        </div>
      </div>
    </section>

    <TickerBar :items="site.ticker" :secondary="site.skills" />

    <!-- 数据带 -->
    <section class="shell py-12 sm:py-14">
      <div
        ref="statsRef"
        class="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4"
        data-reveal
      >
        <div v-for="(item, i) in statsBand" :key="item.label">
          <p class="label">{{ item.label }}</p>
          <p class="mt-2.5 text-4xl font-black tracking-tight sm:text-5xl">
            <span :ref="(el) => (statEls[i] = el)">0</span>
            <span class="text-accent">{{ item.suffix }}</span>
          </p>
          <p class="mt-1.5 text-sm text-muted">{{ item.hint }}</p>
        </div>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="shell pb-14">
      <SectionHead
        en="writing"
        title="最新文章"
        :description="`共 ${stats.posts} 篇,持续更新中。按主题筛一筛,或者直接往下翻。`"
      >
        <template #action>
          <router-link to="/blog" class="btn btn--sm">
            全部文章 <span class="btn__arrow">→</span>
          </router-link>
        </template>
      </SectionHead>

      <div class="grid gap-4 sm:grid-cols-2" data-reveal-children>
        <ArticleRow
          v-for="(article, i) in latestArticles"
          :key="article.slug"
          :article="article"
          :index="padNumber(i + 1)"
        />
      </div>
    </section>

    <!-- 短记 -->
    <section id="notes" class="shell scroll-mt-24 pb-14">
      <SectionHead
        en="notes"
        title="短记"
        description="不值得写成长文的碎碎念,都扔在这儿。"
      >
        <template #aside>
          <span class="label">{{ notes.length }} 条</span>
        </template>
      </SectionHead>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-children>
        <NoteCard v-for="note in latestNotes" :key="note.id" :note="note" />
      </div>
    </section>

    <!-- 时间线 -->
    <section class="shell pb-14">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_1.8fr]">
        <div data-reveal>
          <SectionHead en="timeline" title="时间线" />
          <p class="mt-1 max-w-xs text-sm leading-relaxed text-muted">
            写作不是线性的,但排成时间线之后,能看出自己哪段时间在硬啃什么。
          </p>
          <router-link to="/archive" class="btn btn--sm mt-5">
            完整归档 <span class="btn__arrow">→</span>
          </router-link>
        </div>

        <div data-reveal>
          <Timeline :groups="timelineGroups" />
        </div>
      </div>
    </section>

    <!-- 标签 -->
    <section class="shell pb-6">
      <SectionHead
        en="tags"
        title="标签云"
        :description="`${tags.length} 个标签。字号按文章数量缩放。`"
      >
        <template #action>
          <router-link to="/tags" class="btn btn--sm">
            全部标签 <span class="btn__arrow">→</span>
          </router-link>
        </template>
      </SectionHead>

      <div data-reveal>
        <TagCloud :tags="tags" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/scroll";
import { countUp } from "../lib/motion";
import { site } from "../data/site";
import { articles, latestArticles, tags, stats } from "../data/articles";
import { latestNotes, notes } from "../data/notes";
import { groupByYear, padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";

import HeroField from "../components/HeroField.vue";
import TickerBar from "../components/TickerBar.vue";
import SectionHead from "../components/SectionHead.vue";
import ArticleRow from "../components/ArticleRow.vue";
import NoteCard from "../components/NoteCard.vue";
import Timeline from "../components/Timeline.vue";
import TagCloud from "../components/TagCloud.vue";

const heroRef = ref(null);
const statsRef = ref(null);
const statEls = ref([]);
let statsObserver = null;

const statsBand = [
  { label: "Posts", value: stats.posts, suffix: "+", hint: "篇文章" },
  { label: "Tags", value: stats.tags, suffix: "", hint: "个标签" },
  { label: "Words", value: Math.round(stats.words / 1000), suffix: "k", hint: "字左右的输出" },
  { label: "Since", value: site.since, suffix: "", hint: "持续更新中" },
];

const timelineGroups = computed(() =>
  groupByYear(articles)
    .slice(0, 2)
    .map((group) => ({ year: group.year, items: group.items.slice(0, 6) }))
);

usePageChrome();

onMounted(() => {
  const items = heroRef.value?.querySelectorAll("[data-hero-item]");
  if (items?.length && !prefersReducedMotion()) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 30, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.88,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.08,
        clearProps: "filter,transform,opacity",
      }
    );
  }

  // 数字滚动
  if (!statsRef.value) return;
  if (prefersReducedMotion()) {
    statsBand.forEach((item, i) => {
      if (statEls.value[i]) statEls.value[i].textContent = item.value;
    });
    return;
  }

  statsObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      statsBand.forEach((item, i) => {
        countUp(statEls.value[i], Number(item.value), { delay: i * 0.09 });
      });
      statsObserver?.disconnect();
    },
    { threshold: 0.25 }
  );
  statsObserver.observe(statsRef.value);
});

onBeforeUnmount(() => statsObserver?.disconnect());
</script>
