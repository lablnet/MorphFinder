import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "serve-public-index",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url !== "/" && req.url !== "/index.html") {
            next();
            return;
          }

          const htmlPath = resolve(__dirname, "public/index.html");
          const html = readFileSync(htmlPath, "utf-8");
          const transformed = await server.transformIndexHtml(req.url, html);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(transformed);
        });
      },
      closeBundle() {
        const builtIndex = resolve(__dirname, "dist/public/index.html");
        const rootIndex = resolve(__dirname, "dist/index.html");

        if (existsSync(builtIndex)) {
          copyFileSync(builtIndex, rootIndex);
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "public/index.html"),
      },
    },
  },
});
