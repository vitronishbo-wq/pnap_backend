import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Import Controllers
import authRouter from "./server/controllers/auth.controller";
import backofficeRouter from "./server/controllers/backoffice.controller";

// Import Middlewares
import { authenticateJWT } from "./server/middleware/rbac.middleware";
import { dbService } from "./server/db-service";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes (Mounted first so Vite doesn't intercept other API paths)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "PNAP-AO Backend Server up & running." });
  });

  // Institutional Event Bus Routes (Database persistence for audit trail)
  app.get("/api/events", async (req, res) => {
    try {
      const events = await dbService.getEvents();
      res.json({ success: true, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const saved = await dbService.saveEvent(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Authentication & Session Routes
  app.use("/api/auth", authRouter);

  // Management & Safety Logs Scoped Control Routes (Secured globally with JWT verification)
  app.use("/api/backoffice", authenticateJWT, backofficeRouter);

  // Vite Development and Production Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    console.log("启动 VITE 调试模式 (Vite Dev Middleware)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("启动 生产静态资源模式 (Serving production assets)...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // SPA routing callback (Express v4 pattern)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`================================================================`);
    console.log(`🚀 SERVIDOR GENERAL PNAP EXECUCCIÓN: http://localhost:${PORT}`);
    console.log(`🌟 Port: ${PORT} | Bound: 0.0.0.0 | Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`================================================================`);
  });
}

startServer().catch((error) => {
  console.error("Fatal error during backend server execution bootstrap:", error);
});
