<template>
  <div class="shell py-12 sm:py-14">
    <section class="grid gap-10 lg:grid-cols-[1.5fr_1fr]" data-reveal>
      <div>
        <div class="flex items-center gap-2.5">
          <span class="label label--accent">// ABOUT</span>
          <span class="rule"></span>
        </div>

        <h1 class="display mt-4 text-4xl sm:text-6xl">关于我</h1>

        <div class="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            我是 <span class="font-semibold text-ink">{{ site.fullName }}</span
            >,前端工程师,主要做数据可视化与三维方向。
          </p>
          <p>
            工作中最常处理的两件事:把一堆数字变成能看懂的图,以及把别人的三维场景从 20fps 修到 60fps。
            两件事都不算高深,但都靠耐心。
          </p>
          <p>
            这个站点是我的工作记录。写下来的东西分三类:能复用的方案、当时没想明白的取舍、以及代价很大的错误。
            第三类最有价值,但最难写。
          </p>
          <p>
            本站是纯前端项目:Vue 3 + Vite + GSAP 手搓,文章从 Markdown 原文直出,所有数据都是虚构的。
          </p>
        </div>

        <div class="mt-8 flex flex-wrap gap-2.5">
          <router-link to="/blog" class="btn btn--solid">
            读文章 <span class="btn__arrow">→</span>
          </router-link>
          <router-link to="/projects" class="btn">看项目</router-link>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-2xl border border-line bg-surface p-5">
          <div class="flex items-center gap-3">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-mono text-lg font-bold text-white"
            >
              {{ site.name[0] }}
            </span>
            <div>
              <p class="font-extrabold leading-tight">{{ site.fullName }}</p>
              <p class="label mt-1">{{ site.role }}</p>
            </div>
          </div>

          <dl class="mt-5 space-y-2.5 text-sm">
            <div class="flex items-baseline justify-between gap-3">
              <dt class="label">位置</dt>
              <dd>{{ site.location }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="label">开始写</dt>
              <dd class="font-mono">{{ site.since }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="label">文章</dt>
              <dd class="font-mono">{{ stats.posts }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="label">状态</dt>
              <dd class="flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 bg-accent"></span>
                {{ site.status.text }}
              </dd>
            </div>
          </dl>

          <div class="mt-5 border-t border-line pt-4">
            <p class="label">联系</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <a
                v-for="item in site.socials"
                :key="item.label"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                class="tag"
              >
                {{ item.label }}<span v-if="item.external" class="text-accent">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div class="corner-marks border border-line bg-soft p-5">
          <p class="label">一句</p>
          <p class="mt-2 text-sm leading-relaxed">
            技术债的利息很高,但重写的本金更高。
          </p>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="mt-14" data-reveal>
      <div class="mb-3 flex items-baseline gap-3">
        <h2 class="text-lg font-black tracking-tight">技术栈</h2>
        <span class="rule"></span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="skill in site.skills" :key="skill" class="tag !text-xs">
          {{ skill }}
        </span>
      </div>
    </section>

    <!-- 现在 -->
    <section class="mt-14" data-reveal>
      <div class="mb-4 flex items-baseline gap-3">
        <h2 class="text-lg font-black tracking-tight">现在</h2>
        <span class="label">updated 2026.11</span>
        <span class="rule"></span>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div v-for="item in nowItems" :key="item.title" class="card p-5">
          <p class="label label--accent">{{ item.kind }}</p>
          <h3 class="mt-2 font-semibold">{{ item.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 站内 -->
    <section class="mt-14" data-reveal>
      <div class="mb-4 flex items-baseline gap-3">
        <h2 class="text-lg font-black tracking-tight">站内</h2>
        <span class="rule"></span>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <router-link
          v-for="item in site.footerNav"
          :key="item.to"
          :to="item.to"
          class="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-ink/30 hover:bg-soft"
        >
          <span class="text-sm font-medium">{{ item.label }}</span>
          <span class="text-muted transition-transform duration-300 group-hover:translate-x-1">→</span>
        </router-link>
      </div>
    </section>

    <p class="mt-12 border-t border-line pt-5 text-sm text-muted" data-reveal>
      说明:当前站点为纯前端版本,文章、项目、留言均为虚构数据,用于演示交互与版式。
    </p>
  </div>
</template>

<script setup>
import { site } from "../data/site";
import { stats } from "../data/articles";
import { usePageChrome } from "../composables/usePageChrome";

const nowItems = [
  {
    kind: "在做",
    title: "WebGL 轻量编辑器",
    desc: "把场景图缩到 38KB,顺便补上光照与导出。",
  },
  {
    kind: "在学",
    title: "着色器与程序化材质",
    desc: "用片元着色器画木纹和布料,不再依赖贴图。",
  },
  {
    kind: "在写",
    title: "「前端可视化手册」系列",
    desc: "已经写了三篇,第四篇准备讲后处理管线。",
  },
];

usePageChrome();
</script>
