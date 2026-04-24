// Lightweight WebAudio click sound. No assets, no network.
// Toggle via localStorage("sfx") = "off" to mute.

let ctx: AudioContext | null = null;
let enabled = typeof window !== "undefined" && localStorage.getItem("sfx") !== "off";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      ctx = new Ctx();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setSfxEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem("sfx", on ? "on" : "off");
  } catch {
    /* noop */
  }
}

export function isSfxEnabled() {
  return enabled;
}

/** Plays a short, pleasant UI click. Safe to call from any handler. */
export function playClick(variant: "tap" | "soft" | "success" = "tap") {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") c.resume().catch(() => undefined);
    const o = c.createOscillator();
    const g = c.createGain();
    const now = c.currentTime;
    const freq = variant === "success" ? 880 : variant === "soft" ? 520 : 720;
    o.type = "sine";
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.08);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g).connect(c.destination);
    o.start(now);
    o.stop(now + 0.14);
  } catch {
    /* noop */
  }
}

/** Global delegated listener — every <button> tap plays a click. */
export function installGlobalClickSfx() {
  if (typeof window === "undefined") return;
  if ((window as any).__sfxInstalled) return;
  (window as any).__sfxInstalled = true;
  window.addEventListener(
    "pointerdown",
    (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const btn = t.closest("button, a, [role='button']") as HTMLElement | null;
      if (!btn) return;
      if (btn.hasAttribute("data-no-sfx")) return;
      if ((btn as HTMLButtonElement).disabled) return;
      playClick("tap");
    },
    { passive: true },
  );
}