<template>
  <header class="section-head">
    <div class="section-top">
      <span class="label label--accent">// {{ en }}</span>
      <span class="rule"></span>
      <slot name="aside" />
    </div>

    <div class="section-main">
      <div class="min-w-0">
        <component
          :is="as"
          class="display"
          :class="large ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'"
        >
          {{ title }}
        </component>
        <p v-if="description" class="mt-2.5 max-w-xl text-sm leading-relaxed text-muted">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.action" class="flex flex-wrap items-center gap-2">
        <slot name="action" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  index: { type: String, default: "" },
  en: { type: String, default: "" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  large: { type: Boolean, default: false },
  /** 页面首屏用 h1, 页面内分节用 h2 */
  as: { type: String, default: "h2" },
});
</script>
