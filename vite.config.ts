import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/", // Ensure this matches your hosting path
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto", 
      
      devOptions: {
        enabled: true,
        type: "module",
      },

      manifest: {
        name: "Hospital Management System",
        short_name: "HMS",
        description: "Hospital Management System",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/", // Change to "." if hosting in a subfolder
        icons: [
          {
            src: "logo.png", // Removed leading slash for better resolution
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        // 1. MUST include js and css for production stability
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        
        // 2. Clear out old service workers immediately
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,

        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "hospital-images",
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // Removed the script/style block to let Precaching handle it
        ],
      },
    }),
  ],
});