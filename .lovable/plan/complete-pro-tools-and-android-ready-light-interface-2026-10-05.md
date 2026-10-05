# Complete Pro tools and Android-ready light interface

## Build
- Remove the dark-mode switch and keep the Academic light appearance everywhere, including Android browser chrome and install metadata.
- Add an authenticated AI Paper Copy Checker screen with PDF/image upload, subject selection, one-free-check state, evaluation notice, and sample comparison. Keep submission safely unavailable until email delivery is configured.
- Add a Pro plans screen showing ₹49/month and ₹249/attempt, with clear contact guidance and no fake checkout.
- Gate Focus Music behind the Pro screen and add Copy Checker to the AI Tools Hub and navigation.
- Polish layouts, touch targets, safe areas, and compact spacing for Android phones, tablets, and desktop.

## Technical details
- Use local per-user state for the free-check interface until a server-backed evaluation and verified email sender are available; do not claim that files were submitted.
- Keep existing authentication guards and lazy-loaded routes.
- Align Capacitor/PWA identity and light theme colors, then validate key routes at desktop and Android-sized viewports.
