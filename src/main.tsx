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
  // Resolve the virtual PWA module via a runtime string so TS doesn't need a hard type for it.
  const pwaModule: string = "virtual:pwa-register";
  (import(/* @vite-ignore */ pwaModule) as Promise<{ registerSW: (o?: unknown) => void }>)
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {});
}

const root = document.getElementById("root");
if (!root) throw new Error("App root is missing");
createRoot(root).render(<App />);
