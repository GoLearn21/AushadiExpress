import React from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App";
import "./index.css";

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New content available, refresh to update');
  },
  onOfflineReady() {
    console.log('[PWA] App ready to work offline');
  },
  onRegistered(registration) {
    console.log('[PWA] Service Worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration error:', error);
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
