import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server): Promise<void> {
  // Only enable Vite in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    // Load vite config with proper root
    const clientRoot = path.resolve(import.meta.dirname, '../client');
    
    const serverOptions = {
      middlewareMode: true,
      hmr: false,
      allowedHosts: true as const,
    };

    const vite = await createViteServer({
      root: clientRoot,
      configFile: path.resolve(clientRoot, 'vite.config.ts'),
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  } catch (error) {
    console.error('Error in Vite setup:', error);
    throw error; // Re-throw to be caught by the server's error handler
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/client");

  if (!fs.existsSync(distPath)) {
    console.error(`Build directory not found: ${distPath}`);
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`Available directories:`, fs.readdirSync(process.cwd()));
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
