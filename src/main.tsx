import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA service worker — only register outside the Lovable preview iframe.
const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
const isPreview =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");
if (isPreview || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
} else {
  // Dynamically resolve the virtual PWA module so TS doesn't need a hard type for it.
  (import(/* @vite-ignore */ "virtual:pwa-register") as Promise<{ registerSW: (o?: unknown) => void }>)
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
