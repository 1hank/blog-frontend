import { onMounted, nextTick } from "vue";
import { observeReveals, enhanceMagnetic, refreshMarquee } from "../lib/motion";
import { refreshScroll } from "../lib/scroll";

/**
 * 每个页面的通用收尾工作:
 * 绑定磁性按钮、注册滚动显现、刷新跑马灯动画引用、重算滚动触发器。
 */
export function usePageChrome() {
  onMounted(async () => {
    await nextTick();
    enhanceMagnetic();
    observeReveals();
    refreshMarquee();
    refreshScroll(140);
  });
}
