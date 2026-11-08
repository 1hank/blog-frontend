<template>
  <div class="prose-blog" v-html="html"></div>
</template>

<script setup>
defineProps({
  html: { type: String, default: "" },
});
</script>
