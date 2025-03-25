import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  app.get('/api/scores', async (req, res) => {
    // This could fetch scores from a database if implemented
    res.json({ success: true, message: 'Scores API endpoint' });
  });

  // Simplify static file serving - serve everything from the root directory first
  app.use(express.static(path.join(process.cwd())));
  
  // Explicitly serve our JS files
  app.use('/js', express.static(path.join(process.cwd(), 'js')));
  
  // Explicitly serve our index.html at the root
  app.get('/', (req, res) => {
    console.log('Serving index.html from', path.join(process.cwd(), 'index.html'));
    res.sendFile(path.join(process.cwd(), 'index.html'));
  });

  // Log routes for debugging
  app.use((req, res, next) => {
    console.log(`Request for: ${req.url}`);
    next();
  });

  const httpServer = createServer(app);

  return httpServer;
}
