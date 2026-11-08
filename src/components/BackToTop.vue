<template>
  <transition name="fab">
    <button
      v-show="shown"
      type="button"
      class="fab is-shown"
      aria-label="回到顶部"
      title="回到顶部"
      @click="toTop"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { scrollToTop } from "../lib/scroll";

const shown = ref(false);

function onScroll() {
  shown.value = window.scrollY > 720;
}

const toTop = () => scrollToTop(false);

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(14px);
}
.fab-enter-active,
.fab-leave-active {
  transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
