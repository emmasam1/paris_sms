import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      // ✅ Enable in dev to test without building
      devOptions: {
        enabled: true,
        type: "module", // Required for modern browsers in dev mode
      },

      includeAssets: ["favicon.svg", "robots.txt"],

      manifest: {
        name: "Hospital Management System",
        short_name: "HMS",
        description: "Hospital Management System",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        // Only precache files that definitely exist (like items in your /public folder)
        // This prevents the "pattern doesn't match any files" warning in dev
        globPatterns: ["**/*.{ico,png,svg,webmanifest}"],

        // Allow larger files to be cached if needed
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "hospital-images",
              expiration: { maxEntries: 50 },
            },
          },
          {
            // This handles your Tailwind styles and JS scripts in dev
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "hospital-assets",
            },
          },
        ],
      },
    }),
  ],
});