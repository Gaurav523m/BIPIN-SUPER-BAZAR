import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { PgStorage, initializeDatabase } from "./pg-storage";
import { storage as memStorage } from "./storage";
import { db } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create PostgreSQL storage implementation
export const pgStorage = new PgStorage();

// Override the memory storage with PostgreSQL storage
import { storage } from "./storage";
Object.assign(storage, pgStorage);

(async () => {
  try {
    // Initialize demo data if needed
    await initializeDatabase();
    console.log("Database setup complete");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Fall back to in-memory storage if database setup fails
    console.log("Falling back to in-memory storage");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment variable or default to 5000
  const port = process.env.PORT || 5000;
  
  // Log the port being used
  console.log(`Starting server on port ${port}...`);
  
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    log(`Server running on port ${port}`);
    console.log(`Server running successfully on port ${port}`);
  });
})();
