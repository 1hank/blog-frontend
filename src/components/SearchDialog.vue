<template>
  <dialog
    ref="dialogRef"
    class="palette"
    aria-label="站内搜索"
    @close="onNativeClose"
    @click="onBackdropClick"
  >
    <div class="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
      <span class="label label--accent shrink-0">&gt;</span>
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        class="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted/70"
        placeholder="搜索文章 / 项目 / 短记"
        autocomplete="off"
        spellcheck="false"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="go(activeIndex)"
        @keydown.esc.prevent="close"
      />
      <kbd class="kbd shrink-0">ESC</kbd>
    </div>

    <div class="max-h-[54vh] overflow-y-auto overscroll-contain py-1.5">
      <!-- 空状态 -->
      <div v-if="!query.trim()" class="px-3.5 pb-3 pt-2">
        <p class="label">试试这些词</p>
        <div class="mt-2.5 flex flex-wrap gap-1.5">
          <button
            v-for="word in suggestions"
            :key="word"
            type="button"
            class="tag"
            @click="query = word"
          >
            {{ word }}
          </button>
        </div>

        <p class="label mt-6">最近更新</p>
        <div class="mt-1">
          <router-link
            v-for="article in recent"
            :key="article.slug"
            :to="`/blog/${article.slug}`"
            class="palette-row group"
            @click="close"
          >
            <span class="caret">›</span>
            <span class="flex items-baseline gap-3">
              <span class="min-w-0 flex-1 truncate text-sm">{{ article.title }}</span>
              <span class="index shrink-0">{{ article.date.slice(5) }}</span>
            </span>
          </router-link>
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else-if="!results.length" class="px-3.5 py-10 text-center">
        <p class="font-mono text-2xl text-muted">∅</p>
        <p class="mt-3 text-sm text-muted">
          没有匹配「<span class="text-ink">{{ query }}</span>」的内容
        </p>
        <p class="mt-1 font-mono text-[11px] text-muted/70">
          换个词, 比如「动效」「WebGL」「性能」
        </p>
      </div>

      <!-- 结果 -->
      <div v-else>
        <p class="label px-3.5 pb-1 pt-2">{{ results.length }} 条结果</p>
        <router-link
          v-for="(item, index) in results"
          :key="`${item.type}-${item.id}`"
          :to="item.href"
          class="palette-row"
          :class="{ 'is-active': index === activeIndex }"
          @mouseenter="activeIndex = index"
          @click="close"
        >
          <span class="caret">›</span>
          <div class="min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="label label--accent shrink-0">{{ item.type }}</span>
              <span
                class="truncate text-sm font-semibold text-ink"
                v-html="highlight(item.title, query)"
              ></span>
            </div>
            <p
              class="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted"
              v-html="highlight(item.excerpt, query)"
            ></p>
            <p class="index mt-1 text-[0.62rem]">{{ item.meta }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <div
      class="flex items-center justify-between gap-3 border-t border-line px-3.5 py-2"
    >
      <span class="label flex items-center gap-1.5">
        <kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> 选择
        <kbd class="kbd">↵</kbd> 打开
      </span>
      <span class="label">INDEX · {{ poolSize }}</span>
    </div>
  </dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearch } from "../composables/useSearch";
import { searchAll, searchPool, highlight } from "../lib/search";
import { latestArticles } from "../data/articles";
import { getLenis } from "../lib/scroll";

const route = useRoute();
const router = useRouter();
const { searchOpen, closeSearch } = useSearch();

const dialogRef = ref(null);
const inputRef = ref(null);
const query = ref("");
const activeIndex = ref(0);

const poolSize = searchPool.length;
const suggestions = ["动效", "WebGL", "性能", "CI", "Canvas", "写作"];
const recent = latestArticles.slice(0, 4);

const results = computed(() => searchAll(query.value));

watch(results, () => {
  activeIndex.value = 0;
});

watch(searchOpen, (open) => {
  if (open) openDialog();
  else closeDialog();
});

watch(
  () => route.path,
  () => {
    if (searchOpen.value) closeSearch();
  }
);

function openDialog() {
  const el = dialogRef.value;
  if (!el) return;

  query.value = "";
  activeIndex.value = 0;

  if (!el.open) el.showModal();
  getLenis()?.stop();
  nextTick(() => inputRef.value?.focus());
}

function closeDialog() {
  const el = dialogRef.value;
  if (el?.open) el.close();
  getLenis()?.start();
}

function close() {
  closeSearch();
}

function onNativeClose() {
  if (searchOpen.value) searchOpen.value = false;
  getLenis()?.start();
}

function onBackdropClick(event) {
  if (event.target === dialogRef.value) close();
}

function move(step) {
  if (!results.value.length) return;
  activeIndex.value =
    (activeIndex.value + step + results.value.length) % results.value.length;

  nextTick(() => {
    const active = dialogRef.value?.querySelector(".palette-row.is-active");
    active?.scrollIntoView({ block: "nearest" });
  });
}

function go(index) {
  const item = results.value[index];
  if (!item) return;
  close();
  router.push(item.href);
}

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function onKeydown(event) {
  const key = event.key.toLowerCase();

  if ((event.metaKey || event.ctrlKey) && key === "k") {
    event.preventDefault();
    searchOpen.value = !searchOpen.value;
    return;
  }

  if (event.key === "Escape" && searchOpen.value) {
    event.preventDefault();
    close();
    return;
  }

  if (event.key === "/" && !isTypingTarget(event.target) && !searchOpen.value) {
    event.preventDefault();
    searchOpen.value = true;
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>
