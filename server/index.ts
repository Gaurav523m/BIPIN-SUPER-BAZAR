import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { PgStorage, initializeDatabase } from "./pg-storage";
import { storage } from "./storage";
import { db } from "./db";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'grocery-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local authentication strategy
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      
      // In a real application, use proper password hashing and comparison
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
// Only set up if the required environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'), false);
      }
      
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await storage.createUser({
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() || `google_${profile.id}`,
          name: profile.displayName || 'Google User',
          email: email,
          password: 'google-oauth', // Placeholder password for OAuth users
          role: 'customer'
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

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
      console.log(logLine);
    }
  });

  next();
});

// Create PostgreSQL storage implementation
const pgStorage = new PgStorage();

// Override the memory storage with PostgreSQL storage
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
