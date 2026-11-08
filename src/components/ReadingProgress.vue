<template>
  <div id="reading-progress" ref="bar" aria-hidden="true"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const bar = ref(null);
let frame = 0;

function update() {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  const ratio = max > 0 ? el.scrollTop / max : 0;
  if (bar.value) {
    bar.value.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }
}

function onScroll() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
}

onMounted(() => {
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
});
</script>
