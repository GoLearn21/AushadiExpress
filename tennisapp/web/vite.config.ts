import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  css: { postcss: { plugins: [] } },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Rally", short_name: "Rally", display: "standalone",
        background_color: "#0B0B0F", theme_color: "#0B0B0F", start_url: "/",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: { navigateFallback: "/index.html", navigateFallbackDenylist: [/^\/api\//] },
    }),
  ],
  test: { include: ["test/**/*.test.ts"] },
});
