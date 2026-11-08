import { createApp } from "vue";
import "./style.css";
import "lenis/dist/lenis.css";
import App from "./App.vue";
import router from "./router";
import { initTheme } from "./composables/useTheme";
import { initSmoothScroll } from "./lib/scroll";
import { initGlobalMotion } from "./lib/motion";

initTheme();
initSmoothScroll();
initGlobalMotion();

const app = createApp(App);
app.use(router);
app.mount("#app");
