<template>
  <div>
    <div
      v-for="group in groups"
      :id="`year-${group.year}`"
      :key="group.year"
      class="mb-10 scroll-mt-24 last:mb-0"
    >
      <div class="flex items-baseline gap-3">
        <h3 class="text-xl font-black tracking-tight">{{ group.year }}</h3>
        <span class="label">{{ group.items.length }} 篇</span>
        <span class="rule"></span>
      </div>

      <div v-if="group.months" class="mt-5 space-y-6">
        <div v-for="month in group.months" :key="month.key">
          <p class="label label--accent">{{ month.label }}</p>
          <ul class="mt-2.5 space-y-3">
            <li v-for="item in month.items" :key="item.slug" class="timeline-item">
              <router-link :to="`/blog/${item.slug}`" class="group flex items-baseline gap-3">
                <span class="index w-11 shrink-0">{{ formatMonthDay(item.date) }}</span>
                <span class="text-sm text-muted transition-colors group-hover:text-accent">
                  {{ item.title }}
                </span>
                <span class="label ml-auto hidden shrink-0 sm:block">
                  {{ item.category }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <ul v-else class="mt-4 space-y-3">
        <li v-for="item in group.items" :key="item.slug" class="timeline-item">
          <router-link :to="`/blog/${item.slug}`" class="group flex items-baseline gap-3">
            <span class="index w-11 shrink-0">{{ formatMonthDay(item.date) }}</span>
            <span class="text-sm text-muted transition-colors group-hover:text-accent">
              {{ item.title }}
            </span>
            <span class="label ml-auto hidden shrink-0 sm:block">{{ item.category }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { formatMonthDay } from "../lib/format";

defineProps({
  groups: { type: Array, required: true },
});
</script>
