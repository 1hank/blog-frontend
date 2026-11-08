<template>
  <div class="select-none" aria-hidden="true">
    <div class="ticker ticker--top">
      <div class="ticker__track">
        <span v-for="copy in 2" :key="`top-${copy}`" class="ticker__item">
          <template v-for="(item, i) in items" :key="`t-${copy}-${i}`">
            <span>{{ item }}</span>
            <span class="ticker__dot">·</span>
          </template>
        </span>
      </div>
    </div>

    <div class="ticker ticker--bottom">
      <div class="ticker__track ticker__track--rev">
        <span v-for="copy in 2" :key="`bottom-${copy}`" class="ticker__item">
          <template v-for="(item, i) in secondary" :key="`b-${copy}-${i}`">
            <span>{{ item }}</span>
            <span class="ticker__dot">·</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { refreshMarquee } from "../lib/motion";

defineProps({
  items: { type: Array, required: true },
  secondary: { type: Array, default: () => [] },
});

onMounted(() => {
  // 动画实例在挂载后才存在, 必须重新收集一次
  refreshMarquee();
});
</script>
