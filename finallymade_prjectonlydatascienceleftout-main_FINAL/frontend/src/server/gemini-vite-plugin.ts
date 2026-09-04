import type { Plugin } from "vite";
import { handleGeminiApiRequest } from "./gemini-handler";

export function geminiVitePlugin(): Plugin {
  return {
    name: "gemini-counselling-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/counselling/gemini", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method Not Allowed" }));
          return;
        }

        let rawBody = "";
        req.on("data", (chunk) => {
          rawBody += chunk;
        });

        req.on("end", async () => {
          try {
            const body = JSON.parse(rawBody || "{}");
            const { task, payload } = body;

            if (!task) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Task name required" }));
              return;
            }

            const result = await handleGeminiApiRequest(task, payload || {});
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (e: any) {
            console.error("[Gemini Vite Plugin] Error:", e);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal Server Error", details: e?.message }));
          }
        });
      });
    },
  };
}
