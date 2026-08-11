import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Import Controllers
import authRouter from "./server/controllers/auth.controller";
import backofficeRouter from "./server/controllers/backoffice.controller";

// Import Middlewares
import { authenticateJWT } from "./server/middleware/rbac.middleware";
import { dbService } from "./server/db-service";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check with Active Firestore Validation
  app.get("/api/health", async (req, res) => {
    const startTime = Date.now();
    let firestoreStatus = "disconnected";
    let latencyMs = 0;

    try {
      if (typeof dbService !== "undefined" && dbService.getEvents) {
        await dbService.getEvents();
        firestoreStatus = "connected";
      }
      latencyMs = Date.now() - startTime;

      res.status(200).json({
        status: "ok",
        service: "PNAP-AO API",
        timestamp: new Date().toISOString(),
        database: {
          provider: "firestore",
          status: firestoreStatus,
          latencyMs: `${latencyMs}ms`
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        service: "PNAP-AO API",
        timestamp: new Date().toISOString(),
        database: {
          provider: "firestore",
          status: "error",
          error: error.message
        }
      });
    }
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
    console.log("Iniciando modo desenvolvimento Vite (Vite Dev Middleware)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando modo estático de produção (Serving production assets)...");
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");
    
    // Serve static files if directory exists
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    
    // SPA routing fallback / API root status check
    app.get("*", (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).json({
          status: "online",
          service: "PNAP-AO API Service",
          message: "Servidor API Node.js em execução. O frontend é servido via Firebase Hosting / CDN.",
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`================================================================`);
    console.log(`🚀 SERVIDOR GENERAL PNAP EM EXECUÇÃO: http://localhost:${PORT}`);
    console.log(`🌟 Port: ${PORT} | Bound: 0.0.0.0 | Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`================================================================`);
  });
}

startServer().catch((error) => {
  console.error("Fatal error during backend server execution bootstrap:", error);
});