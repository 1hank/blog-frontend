<template>
  <nav aria-label="文章目录">
    <div class="mb-3 flex items-center gap-2.5">
      <span class="label">目录</span>
      <span class="rule"></span>
      <span class="index">{{ visibleHeadings.length }}</span>
    </div>

    <a
      v-for="heading in visibleHeadings"
      :key="heading.id"
      :href="`#${heading.id}`"
      class="toc-link"
      :class="{
        'toc-active': activeId === heading.id,
        'is-nested': heading.level === 3,
      }"
      @click="go($event, heading.id)"
    >
      {{ heading.text }}
    </a>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { scrollToSelector } from "../lib/scroll";

const props = defineProps({
  headings: { type: Array, default: () => [] },
});

const activeId = ref("");
let frame = 0;

const visibleHeadings = computed(() =>
  props.headings.filter((heading) => heading.level === 2 || heading.level === 3)
);

function update() {
  const elements = visibleHeadings.value
    .map((heading) => document.getElementById(heading.id))
    .filter(Boolean);

  if (!elements.length) {
    activeId.value = "";
    return;
  }

  let current = elements[0].id;
  for (const element of elements) {
    if (element.getBoundingClientRect().top <= 120) current = element.id;
  }
  activeId.value = current;
}

function onScroll() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
}

function go(event, id) {
  event.preventDefault();
  scrollToSelector(`#${id}`, -90);
  try {
    history.replaceState(null, "", `#${id}`);
  } catch {
    /* 忽略 */
  }
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
