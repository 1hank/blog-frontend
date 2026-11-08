<template>
  <div v-if="project" class="shell py-10 sm:py-12">
    <router-link
      to="/projects"
      class="label inline-flex items-center gap-1.5 transition-colors hover:text-accent"
    >
      ← 返回项目
    </router-link>

    <div class="mt-6 grid border border-line md:grid-cols-[1.05fr_1fr]" data-reveal>
      <div class="cover relative aspect-[16/9] md:aspect-auto">
        <span class="cover__mark"></span>
        <span class="cover__num">{{ index }}</span>
      </div>

      <div class="border-t border-line p-6 sm:p-8 md:border-l md:border-t-0">
        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span class="index">{{ project.year }}</span>
          <span class="label text-line">/</span>
          <span class="label label--accent">{{ project.status }}</span>
        </div>

        <h1 class="display mt-3 text-3xl leading-tight sm:text-4xl">
          {{ project.title }}
        </h1>
        <p class="label mt-2 normal-case tracking-normal">{{ project.subtitle }}</p>

        <p class="mt-4 text-sm leading-relaxed text-muted">{{ project.desc }}</p>

        <div v-if="project.links.length" class="mt-6 flex flex-wrap gap-2">
          <a
            v-for="link in project.links"
            :key="link.label"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--sm"
          >
            {{ link.label }} <span class="text-accent">↗</span>
          </a>
        </div>
      </div>
    </div>

    <div class="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div class="min-w-0">
        <div class="mb-2 flex items-baseline gap-3" data-reveal>
          <h2 class="text-base font-extrabold">做了什么</h2>
          <span class="rule"></span>
        </div>

        <ul class="mb-8" data-reveal>
          <li
            v-for="item in project.highlights"
            :key="item"
            class="timeline-item border-t border-line py-2.5 text-sm leading-relaxed text-muted last:border-b"
          >
            {{ item }}
          </li>
        </ul>

        <div data-reveal>
          <MarkdownBody :html="html" />
        </div>

        <nav class="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          <router-link
            v-if="prev"
            :to="`/projects/${prev.slug}`"
            class="group border border-line p-4 transition-colors hover:border-ink/50"
          >
            <p class="label">← 上一个</p>
            <p class="mt-2 text-sm font-semibold transition-colors group-hover:text-accent">
              {{ prev.title }}
            </p>
          </router-link>
          <div v-else class="hidden sm:block"></div>

          <router-link
            v-if="next"
            :to="`/projects/${next.slug}`"
            class="group border border-line p-4 transition-colors hover:border-ink/50 sm:text-right"
          >
            <p class="label">下一个 →</p>
            <p class="mt-2 text-sm font-semibold transition-colors group-hover:text-accent">
              {{ next.title }}
            </p>
          </router-link>
        </nav>
      </div>

      <aside class="space-y-5" data-reveal>
        <div class="border border-line bg-soft p-4">
          <p class="label">关键指标</p>
          <dl class="mt-3 space-y-3">
            <div
              v-for="metric in project.metrics"
              :key="metric.label"
              class="flex items-baseline justify-between gap-3"
            >
              <dt class="label">{{ metric.label }}</dt>
              <dd class="font-mono text-lg font-semibold">{{ metric.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="border border-line p-4">
          <p class="label">技术栈</p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in project.stack"
              :key="item.name"
              class="flex items-baseline justify-between gap-3 text-sm"
            >
              <span>{{ item.name }}</span>
              <span class="label normal-case tracking-normal">{{ item.role }}</span>
            </li>
          </ul>
        </div>

        <div class="border border-line p-4">
          <p class="label">标签</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <TagPill v-for="tag in project.tags" :key="tag" :name="tag" />
          </div>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="shell py-24 text-center">
    <p class="font-mono text-3xl text-muted">404</p>
    <h1 class="mt-4 text-lg font-semibold">这个项目不存在</h1>
    <p class="mt-2 text-sm text-muted">它可能还没公开,或者链接拼错了。</p>
    <router-link to="/projects" class="btn btn--sm mt-6">回到项目列表</router-link>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getProject, adjacentProjects, projects } from "../data/projects";
import { renderMarkdown } from "../lib/markdown";
import { padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";

import MarkdownBody from "../components/MarkdownBody.vue";
import TagPill from "../components/TagPill.vue";

const route = useRoute();
const project = computed(() => getProject(String(route.params.slug)));

const html = computed(() =>
  project.value ? renderMarkdown(project.value.content).html : ""
);

const index = computed(() => {
  const position = projects.findIndex((item) => item.slug === project.value?.slug);
  return padNumber(position + 1);
});
const prev = computed(() => adjacentProjects(project.value?.slug).prev);
const next = computed(() => adjacentProjects(project.value?.slug).next);

usePageChrome();
</script>
