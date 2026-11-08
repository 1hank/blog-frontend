<template>
  <footer class="mt-24 border-t border-line">
    <div class="shell flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-muted">
        © {{ year }} {{ site.fullName }} · 由
        <span class="text-ink">Vue 3 + Vite</span> 强力驱动
      </p>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <router-link
          v-for="item in site.footerNav"
          :key="item.to"
          :to="item.to"
          class="label transition-colors hover:text-accent"
        >
          {{ item.label }}
        </router-link>

        <a
          :href="site.github"
          target="_blank"
          rel="noopener noreferrer"
          class="label transition-colors hover:text-accent"
        >
          GitHub ↗
        </a>
        <a href="/feed.xml" class="label transition-colors hover:text-accent">RSS</a>

        <button
          type="button"
          class="label flex items-center gap-1.5 transition-colors hover:text-accent"
          @click="openSearch"
        >
          搜索 <kbd class="kbd">⌘K</kbd>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { site } from "../data/site";
import { useSearch } from "../composables/useSearch";

const { openSearch } = useSearch();
const year = new Date().getFullYear();
</script>
