# JARVIS Starter (Build 0.1)

A free, phone-friendly Progressive Web App starter. It includes a responsive JARVIS-style interface, text chat, and browser speech recognition where supported.

## Important current limitations
- This is a **local demo**, not a connected AI assistant.
- Replies are sample responses.
- It does not control Android settings or read notifications.
- Speech recognition support depends on the browser and may require internet.
- No API key is included. Never put a private AI API key in `app.js` or any browser-visible file.

## Easiest way to test on Android
1. Extract this ZIP.
2. Upload the folder to a static hosting service that provides an HTTPS URL, or run it from a local development server.
3. Open the HTTPS URL in Chrome.
4. Use the text box and microphone button.
5. In Chrome's menu, choose **Install app** or **Add to Home screen** if offered.

A PWA service worker requires HTTPS (or localhost). Opening `index.html` directly from file storage will still show the page, but offline installation features may not work.

## Files
- `index.html` — app layout
- `style.css` — visual design
- `app.js` — chat demo and speech input
- `manifest.json` — installable app metadata
- `service-worker.js` — basic offline cache

## Next build stage
Add a small server-side backend that keeps API credentials private, then connect an AI model. After that, add explicit, permission-based Android automation.
