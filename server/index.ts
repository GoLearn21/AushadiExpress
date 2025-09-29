import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerAIRoutes } from "./ai-routes";
import intelligentAgentRoutes from "./routes/intelligent-agent";
import apiKeyRoutes from "./routes/api-key-management";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register routes
    const server = await registerRoutes(app);
    
    // Register AI routes
    registerAIRoutes(app);
    
    // Register intelligent agent routes
    app.use('/api', intelligentAgentRoutes);
    
    // Register API key management routes
    app.use('/api', apiKeyRoutes);
    
    // Add a test route to verify API is working
    app.get('/api/status', (req, res) => {
      res.json({ status: 'API is running', timestamp: new Date().toISOString() });
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    });

    // 404 handler for API routes
    app.use('/api', (req, res) => {
      res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
    });

    const PORT = process.env.PORT || 3000;

    // Initialize the HTTP server
    const httpServer = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`📡 API endpoints are available at http://localhost:${PORT}/api`);
      console.log(`🔌 Connected to database: ${process.env.PGHOST}`);
      console.log('\n🔍 Try these endpoints:');
      console.log(`   • GET    http://localhost:${PORT}/api/status`);
      console.log(`   • POST   http://localhost:${PORT}/api/ai/chat`);
      console.log('\n⚡ Press Ctrl+C to stop the server\n');
      
      // Setup Vite in development mode
      if (process.env.NODE_ENV === 'development') {
        setupVite(app, httpServer).catch(err => {
          console.error('Failed to setup Vite:', err);
        });
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
