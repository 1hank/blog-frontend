<template>
  <div class="relative flex min-h-screen flex-col">
    <a href="#main" class="skip-link">跳到正文</a>

    <div class="atmosphere" aria-hidden="true">
      <div class="stars"></div>
    </div>

    <AppNav />

    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in" @after-leave="onAfterLeave">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <PageBlinds />
    <SearchDialog />
    <BackToTop />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";
import AppNav from "./components/AppNav.vue";
import AppFooter from "./components/AppFooter.vue";
import PageBlinds from "./components/PageBlinds.vue";
import SearchDialog from "./components/SearchDialog.vue";
import BackToTop from "./components/BackToTop.vue";
import { blinds } from "./lib/blinds";
import { initGlobalMotion, observeReveals, refreshMarquee } from "./lib/motion";
import { refreshScroll } from "./lib/scroll";

/**
 * 旧页面离场、新页面即将插进 DOM 的瞬间。
 * 如果幕布正盖着屏幕, 就在这里把它拉下去 —— 用户看到的是已渲染好的新页面。
 */
function onAfterLeave() {
  if (!blinds.isPlaying()) return;

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        blinds.reveal();
      });
    });
  });
}

onMounted(() => {
  initGlobalMotion();
  observeReveals();
  refreshMarquee();
  refreshScroll(200);
});
</script>
