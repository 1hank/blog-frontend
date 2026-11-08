<template>
  <div ref="root" class="blinds" aria-hidden="true">
    <div v-for="index in 5" :key="index" class="blinds__panel"></div>
    <span class="blinds__label">
      <strong>{{ site.name.toUpperCase() }}</strong>
      <span>{{ site.mark }}</span>
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { site } from "../data/site";
import { blinds } from "../lib/blinds";

const root = ref(null);

onMounted(() => blinds.bind(root.value));
onBeforeUnmount(() => blinds.bind(null));
</script>
