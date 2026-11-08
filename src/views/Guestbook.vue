<template>
  <div class="shell py-12 sm:py-14">
    <SectionHead
      en="GUESTBOOK"
      title="留言"
      description="不用注册,不用登录。发现问题、想补充一个方案、或者只是打个招呼,都可以写。"
      large
      as="h1"
      data-reveal
    >
      <template #aside>
        <span class="label">{{ guestbookMessages.length }}+ 条</span>
      </template>
    </SectionHead>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div class="min-w-0" data-reveal>
        <CommentsPanel
          storage-key="guestbook"
          title="写点什么"
          hint="纯前端演示:内容保存在浏览器本地,刷新还在,别人看不到。"
          :seed="guestbookMessages"
        />
      </div>

      <aside class="space-y-4" data-reveal>
        <div class="rounded-2xl border border-line bg-soft p-4">
          <p class="label label--accent">留言须知</p>
          <ul class="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            <li>· 技术问题欢迎直接问,能答就答</li>
            <li>· 发现错误请指出,我会改</li>
            <li>· 本站暂无后端,留言仅本地可见</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-line p-4">
          <p class="label label--accent">其他方式</p>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-for="item in site.socials" :key="item.label">
              <a
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                class="link-line text-muted transition-colors hover:text-ink"
              >
                {{ item.label }}<span v-if="item.external" class="text-accent"> ↗</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-line p-4">
          <p class="label label--accent">站内</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <router-link to="/blog" class="tag">文章</router-link>
            <router-link to="/projects" class="tag">项目</router-link>
            <router-link to="/about" class="tag">关于</router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import SectionHead from "../components/SectionHead.vue";
import CommentsPanel from "../components/CommentsPanel.vue";
import { guestbookMessages } from "../data/guestbook";
import { site } from "../data/site";
import { usePageChrome } from "../composables/usePageChrome";

usePageChrome();
</script>
