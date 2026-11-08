<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    aria-hidden="true"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useTheme } from "../composables/useTheme";
import { prefersReducedMotion } from "../lib/scroll";

const props = defineProps({
  max: { type: Number, default: 90 },
  density: { type: Number, default: 14000 },
  linkDistance: { type: Number, default: 110 },
});

const canvasRef = ref(null);
const { theme } = useTheme();

let ctx = null;
let particles = [];
let width = 0;
let height = 0;
let dpr = 1;
let rafId = 0;
let accent = [194, 93, 118];
let visible = true;
let inView = true;
let observer = null;

const mouse = { x: -9999, y: -9999 };

function readAccent() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-rgb")
    .trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) accent = parts;
}

function seed() {
  const count = Math.min(
    props.max,
    Math.max(16, Math.floor((width * height) / props.density))
  );
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
  }));
}

function resize() {
  const canvas = canvasRef.value;
  const parent = canvas?.parentElement;
  if (!canvas || !parent || !ctx) return;

  const rect = parent.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  seed();
}

function onMouseMove(event) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas || !canvas.isConnected) return; // 换页后自终止

  if (ctx && visible && inView && width > 0) {
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 120 && distance > 0.01) {
        const force = ((120 - distance) / 120) * 0.04;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }

      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
    }

    const limit = props.linkDistance;
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < limit) {
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${
            (1 - distance / limit) * 0.3
          })`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.85)`;
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  rafId = requestAnimationFrame(draw);
}

function onVisibilityChange() {
  visible = !document.hidden;
}

onMounted(() => {
  if (prefersReducedMotion()) return;

  const canvas = canvasRef.value;
  ctx = canvas?.getContext("2d");
  if (!ctx) return;

  readAccent();
  resize();

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0 }
  );
  observer.observe(canvas);

  rafId = requestAnimationFrame(draw);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", resize);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  observer?.disconnect();
  observer = null;
});

watch(theme, async () => {
  await nextTick();
  readAccent();
});
</script>
