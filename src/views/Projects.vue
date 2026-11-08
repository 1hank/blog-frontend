<template>
  <div class="shell py-12 sm:py-14">
    <SectionHead
      en="PROJECTS"
      title="项目"
      description="做过的、做了一半的、以及做了之后又推翻的。"
      large
      as="h1"
      data-reveal
    >
      <template #action>
        <a :href="site.github" target="_blank" rel="noopener noreferrer" class="btn btn--sm">
          GitHub <span class="text-accent">↗</span>
        </a>
      </template>
    </SectionHead>

    <!-- 主推 -->
    <section v-if="spotlight" class="mb-12" data-reveal>
      <router-link :to="`/projects/${spotlight.slug}`" class="group block">
        <div class="grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
          <div class="cover relative aspect-[16/10] md:aspect-auto">
            <span class="cover__mark"></span>
            <span class="cover__num">01</span>
            <span class="label absolute left-4 top-3 text-white/75">
              {{ spotlight.status }}
            </span>
          </div>

          <div class="flex flex-col justify-center border-t border-line p-6 md:border-l md:border-t-0 sm:p-9">
            <div class="flex items-center gap-2.5">
              <span class="index">{{ spotlight.year }}</span>
              <span class="label text-line">/</span>
              <span class="label label--accent">{{ spotlight.subtitle }}</span>
            </div>

            <h2
              class="display mt-3 text-2xl transition-colors group-hover:text-accent sm:text-3xl"
            >
              {{ spotlight.title }}
            </h2>

            <p class="mt-3 text-sm leading-relaxed text-muted">{{ spotlight.desc }}</p>

            <dl class="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              <div v-for="metric in spotlight.metrics" :key="metric.label">
                <dt class="label">{{ metric.label }}</dt>
                <dd class="mt-0.5 font-mono text-lg font-semibold">{{ metric.value }}</dd>
              </div>
            </dl>

            <p class="label mt-6 transition-colors group-hover:text-accent">
              查看详情 <span class="btn__arrow inline-block">→</span>
            </p>
          </div>
        </div>
      </router-link>
    </section>

    <div class="mb-4 flex items-baseline gap-3" data-reveal>
      <h2 class="text-lg font-black tracking-tight">全部项目</h2>
      <span class="label">{{ projects.length }} 个</span>
      <span class="rule"></span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-children>
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.slug"
        :project="project"
        :number="padNumber(index + 1)"
      />
    </div>

    <p class="mt-12 border-t border-line pt-5 text-sm text-muted" data-reveal>
      更多实验散落在
      <a :href="site.github" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">
        GitHub
      </a>
      里。当前站点为纯前端版本,项目数据均为虚构。
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SectionHead from "../components/SectionHead.vue";
import ProjectCard from "../components/ProjectCard.vue";
import { projects } from "../data/projects";
import { site } from "../data/site";
import { padNumber } from "../lib/format";
import { usePageChrome } from "../composables/usePageChrome";

const spotlight = computed(
  () => projects.find((project) => project.featured) || projects[0]
);

usePageChrome();
</script>
