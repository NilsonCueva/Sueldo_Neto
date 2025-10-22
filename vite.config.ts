import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGH = mode === "github"; // usa "--mode github" para builds de GitHub Pages

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Netlify/dev => "/", GitHub Pages => 
    base: isGH ? "/Sueldo_Neto/" : "/",
    build: {
      sourcemap: true,
    },
  };
});
