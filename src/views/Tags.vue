<template>
  <div class="shell py-12 sm:py-14">
    <SectionHead
      en="TAGS"
      title="标签"
      :description="`${tags.length} 个标签,${articles.length} 篇文章。字号按文章数缩放。`"
      large
      as="h1"
      data-reveal
    />

    <div class="mb-12" data-reveal>
      <TagCloud :tags="tags" />
    </div>

    <div class="mb-4 flex items-baseline gap-3" data-reveal>
      <h2 class="text-lg font-black tracking-tight">全部标签</h2>
      <span class="rule"></span>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal-children>
      <router-link
        v-for="tag in tags"
        :key="tag.name"
        :to="`/tags/${encodeURIComponent(tag.name)}`"
        class="group"
      >
        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:bg-soft"
        >
          <span class="text-sm font-semibold">
            <span class="text-accent">#</span>{{ tag.name }}
          </span>
          <span class="label flex items-center gap-2">
            {{ tag.count }} 篇
            <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </router-link>
    </div>

    <section v-if="series.length" class="mt-14">
      <div class="mb-4 flex items-baseline gap-3" data-reveal>
        <h2 class="text-lg font-black tracking-tight">系列</h2>
        <span class="rule"></span>
      </div>

      <div class="grid gap-5 lg:grid-cols-2" data-reveal-children>
        <div
          v-for="item in series"
          :key="item.name"
          class="rounded-2xl border border-line bg-surface p-5"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-extrabold">{{ item.name }}</p>
            <span class="index">{{ item.articles.length }} / {{ item.total }}</span>
          </div>

          <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              class="h-full rounded-full bg-accent"
              :style="{ width: `${(item.articles.length / item.total) * 100}%` }"
            ></div>
          </div>

          <ol class="mt-4 space-y-2">
            <li v-for="post in item.articles" :key="post.slug">
              <router-link
                :to="`/blog/${post.slug}`"
                class="group flex items-baseline gap-2 text-sm"
              >
                <span class="index shrink-0">{{ post.series.index }}</span>
                <span class="text-muted transition-colors group-hover:text-ink">
                  {{ post.title }}
                </span>
              </router-link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import SectionHead from "../components/SectionHead.vue";
import TagCloud from "../components/TagCloud.vue";
import { articles, tags, series } from "../data/articles";
import { usePageChrome } from "../composables/usePageChrome";

usePageChrome();
</script>
