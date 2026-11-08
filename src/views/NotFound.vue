<template>
  <div class="shell flex min-h-[68vh] flex-col items-center justify-center py-20 text-center">
    <div class="flex items-center gap-2.5">
      <span class="label label--accent">404</span>
      <span class="label">NOT FOUND</span>
    </div>

    <h1
      class="glitch mt-5 cursor-pointer select-none font-mono text-[5.5rem] font-bold leading-none tracking-tighter sm:text-[9rem]"
      data-text="404"
      title="点我一下"
      @click="onBoom"
    >
      404
    </h1>

    <p class="mt-3 text-lg font-semibold">这个页面不存在</p>
    <p class="mt-2 max-w-md text-sm leading-relaxed text-muted">
      可能被删了、改名了,或者从来没存在过。换个地方逛。
    </p>

    <div class="mt-7 flex flex-wrap justify-center gap-2.5">
      <router-link to="/" class="btn btn--solid">
        回首页 <span class="btn__arrow">→</span>
      </router-link>
      <button type="button" class="btn" @click="openSearch">
        搜索 <kbd class="kbd">⌘K</kbd>
      </button>
    </div>

    <div class="mt-12 grid w-full max-w-xl grid-cols-2 gap-3 text-left sm:grid-cols-3">
      <router-link
        v-for="item in site.footerNav"
        :key="item.to"
        :to="item.to"
        class="group flex items-center justify-between gap-2 rounded-xl border border-line px-4 py-3 transition-colors hover:border-ink/30 hover:bg-soft"
      >
        <span class="text-sm">{{ item.label }}</span>
        <span class="text-muted transition-transform duration-300 group-hover:translate-x-1">→</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { site } from "../data/site";
import { useSearch } from "../composables/useSearch";
import { spawnBoom } from "../lib/motion";
import { usePageChrome } from "../composables/usePageChrome";

const { openSearch } = useSearch();
const onBoom = (event) => spawnBoom(event.clientX, event.clientY, "✳");

usePageChrome();
</script>
