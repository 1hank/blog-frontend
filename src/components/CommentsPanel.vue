<template>
  <section class="overflow-hidden rounded-2xl border border-line bg-surface">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <div class="flex items-center gap-2.5">
        <span class="label label--accent">{{ title }}</span>
        <span class="rule"></span>
      </div>
      <span class="index">{{ messages.length }} 条 · 本地</span>
    </div>

    <div class="px-5 py-5">
      <p class="text-xs leading-relaxed text-muted">{{ hint }}</p>

      <form class="mt-5 grid gap-2.5" @submit.prevent="submit">
        <div class="grid gap-2.5 sm:grid-cols-[170px_1fr]">
          <input
            v-model="form.name"
            class="field font-mono text-xs"
            maxlength="16"
            placeholder="昵称(可选)"
            aria-label="昵称"
          />
          <input
            v-model="form.text"
            class="field"
            maxlength="200"
            :placeholder="replyingTo ? `回复 @${replyingTo}` : '说点什么…'"
            aria-label="留言内容"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <p
            class="font-mono text-[11px] leading-relaxed"
            :class="error ? 'text-accent' : 'text-muted/80'"
          >
            {{ error || "内容只存在这台设备的 localStorage 里" }}
          </p>
          <div class="flex items-center gap-2">
            <button
              v-if="replyingTo"
              type="button"
              class="btn btn--sm"
              @click="replyingTo = ''"
            >
              取消
            </button>
            <button type="submit" class="btn btn--sm btn--solid" :disabled="sending">
              {{ sending ? "写入中…" : "写入" }}
            </button>
          </div>
        </div>
      </form>

      <transition-group tag="ul" name="msg" class="mt-7 block space-y-5">
        <li v-for="message in messages" :key="message.id" class="flex gap-3">
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-xs font-semibold"
            :style="{ color: message.color || '#1f3ad6', borderColor: message.color || '#1f3ad6' }"
          >
            {{ message.avatar }}
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="text-sm font-semibold">{{ message.name }}</span>
              <span class="index">{{ relativeTime(message.time) }}</span>
              <span
                v-if="message.local"
                class="rounded-full border border-accent/40 bg-accent/10 px-2 font-mono text-[9px] uppercase tracking-wider text-accent"
              >
                本地
              </span>
            </div>

            <p class="mt-1 text-sm leading-relaxed text-muted">{{ message.text }}</p>

            <div class="mt-1.5 flex items-center gap-3.5">
              <button
                type="button"
                class="label flex items-center gap-1 transition-colors"
                :class="liked[message.id] ? 'text-accent' : 'hover:text-accent'"
                @click="toggleLike(message)"
              >
                <span>{{ liked[message.id] ? "♥" : "♡" }}</span>
                <span class="tabular-nums">{{ message.likes }}</span>
              </button>
              <button
                type="button"
                class="label transition-colors hover:text-accent"
                @click="replyingTo = message.name"
              >
                回复
              </button>
            </div>

            <div
              v-if="message.reply"
              class="mt-2 border-l-2 border-accent bg-soft px-3 py-2"
            >
              <p class="label label--accent">{{ author }} 回复</p>
              <p class="mt-1 text-sm leading-relaxed text-muted">
                {{ message.reply.text }}
              </p>
            </div>
          </div>
        </li>
      </transition-group>

      <p v-if="!messages.length" class="mt-7 text-sm text-muted">
        还没有留言,来写第一条。
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { relativeTime } from "../lib/format";
import { loadJSON, saveJSON } from "../lib/storage";
import { createMessage } from "../data/guestbook";
import { articleAuthor } from "../data/comments";

const props = defineProps({
  storageKey: { type: String, required: true },
  title: { type: String, default: "评论" },
  hint: {
    type: String,
    default: "纯前端演示:内容保存到浏览器本地,刷新还在,但别人看不到。",
  },
  seed: { type: Array, default: () => [] },
  author: { type: String, default: articleAuthor },
});

const storeKey = computed(() => `blog-thread:${props.storageKey}`);
const likeKey = computed(() => `blog-thread-likes:${props.storageKey}`);

const messages = ref([]);
const liked = reactive({});
const form = reactive({ name: "", text: "" });
const error = ref("");
const sending = ref(false);
const replyingTo = ref("");

const author = computed(() => props.author);

function hydrate() {
  const saved = loadJSON(storeKey.value, []);
  messages.value = [...props.seed, ...(Array.isArray(saved) ? saved : [])];

  const savedLikes = loadJSON(likeKey.value, {});
  Object.keys(liked).forEach((key) => delete liked[key]);
  if (savedLikes && typeof savedLikes === "object") Object.assign(liked, savedLikes);
}

hydrate();

watch(storeKey, hydrate);

function submit() {
  error.value = "";

  const text = form.text.trim();
  if (!text) {
    error.value = "总得写点什么吧";
    return;
  }
  if (text.length < 2) {
    error.value = "至少写两个字";
    return;
  }

  sending.value = true;

  // 模拟一次网络往返
  window.setTimeout(() => {
    const message = createMessage({ name: form.name, text });
    if (replyingTo.value) {
      message.text = `回复 @${replyingTo.value}:${text}`;
    }

    const saved = loadJSON(storeKey.value, []);
    const next = [message, ...(Array.isArray(saved) ? saved : [])];
    saveJSON(storeKey.value, next);
    messages.value = [...props.seed, ...next];

    form.text = "";
    replyingTo.value = "";
    sending.value = false;
  }, 380);
}

function toggleLike(message) {
  const next = !liked[message.id];
  liked[message.id] = next;
  message.likes += next ? 1 : -1;
  saveJSON(likeKey.value, { ...liked });
}
</script>

<style scoped>
.msg-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.msg-enter-active {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
