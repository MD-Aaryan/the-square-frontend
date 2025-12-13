import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import TailwindCSS from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), TailwindCSS()],
  build: {
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
          api: ["axios"],
        },
      },
    },
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "axios",
      "lucide-react",
    ],
  },
});
