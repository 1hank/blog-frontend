<template>
  <header class="topbar">
    <div class="shell topbar__inner">
      <router-link
        to="/"
        class="group flex shrink-0 items-baseline gap-1.5"
        aria-label="回到首页"
        @dblclick="onBoom"
      >
        <span class="hidden text-lg font-black tracking-tight sm:inline">
          {{ site.brand }}
        </span>
        <span class="text-lg font-black tracking-tight sm:hidden">
          {{ site.name }}
        </span>
      </router-link>

      <!-- 桌面端 -->
      <nav class="hidden items-center gap-5 md:flex" aria-label="主导航">
        <router-link
          v-for="item in site.nav"
          :key="item.to"
          :to="item.to"
          class="navlink"
          :class="{ 'is-active': isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="icon-btn"
          aria-label="搜索"
          title="搜索 (Ctrl+K)"
          @click="openSearch"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <ThemeToggle />

        <button
          type="button"
          class="icon-btn md:hidden"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端下拉 -->
    <transition name="menu">
      <div
        v-if="menuOpen"
        class="overflow-hidden border-t border-line bg-bg/95 md:hidden"
      >
        <div class="shell grid grid-cols-2 gap-x-4 gap-y-1 py-3">
          <router-link
            v-for="item in site.nav"
            :key="item.to"
            :to="item.to"
            class="navlink py-2.5"
            :class="{ 'is-active': isActive(item.to) }"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { site } from "../data/site";
import { useSearch } from "../composables/useSearch";
import { spawnBoom } from "../lib/motion";
import ThemeToggle from "./ThemeToggle.vue";

const route = useRoute();
const { openSearch } = useSearch();
const menuOpen = ref(false);

const isActive = (to) =>
  to === "/" ? route.path === "/" : route.path === to || route.path.startsWith(`${to}/`);

const onBoom = (event) => spawnBoom(event.clientX, event.clientY);

watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  }
);
</script>

<style scoped>
.menu-enter-from,
.menu-leave-to {
  max-height: 0;
  opacity: 0;
}
.menu-enter-to,
.menu-leave-from {
  max-height: 22rem;
  opacity: 1;
}
.menu-enter-active,
.menu-leave-active {
  transition: max-height 0.36s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.26s;
}
</style>
