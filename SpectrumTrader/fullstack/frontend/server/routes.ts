import type { Express } from "express";
import { createServer, type Server } from "http";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { existsSync } from "fs";

/**
 * Execute Python backend inference and return the generated omnispectrum data
 */
async function runBackendInference(): Promise<any> {
  try {
    const backendPath = join(process.cwd(), "..", "..", "omnispectrum-backend");
    
    if (!existsSync(backendPath)) {
      console.warn("⚠️ Backend directory not found at:", backendPath);
      return null;
    }

    console.log("🔄 Running backend inference from:", backendPath);
    
    // Run the Python inference script with better error handling
    try {
      const output = execSync(`cd "${backendPath}" && python run_inference.py`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 180000, // 3 minute timeout for full inference
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        }
      });

      console.log("✅ Backend inference completed");
      console.log("Output:", output);

      // Read the generated JSON
      const outputPath = join(backendPath, "data", "omnispectrum.json");
      if (existsSync(outputPath)) {
        const data = readFileSync(outputPath, "utf-8");
        const jsonData = JSON.parse(data);
        
        // Copy to frontend data directory for caching
        const frontendDataPath = join(process.cwd(), "server", "data", "omnispectrum.json");
        writeFileSync(frontendDataPath, JSON.stringify(jsonData, null, 2));
        
        return jsonData;
      }
    } catch (execError: any) {
      // Try alternative approach with python -m
      console.warn("⚠️ Direct Python execution failed, trying module approach...");
      
      const output = execSync(`cd "${backendPath}" && python -m src.inference`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 180000,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        }
      });

      console.log("✅ Backend inference completed (via module)");

      // Read the generated JSON
      const outputPath = join(backendPath, "data", "omnispectrum.json");
      if (existsSync(outputPath)) {
        const data = readFileSync(outputPath, "utf-8");
        const jsonData = JSON.parse(data);
        
        // Copy to frontend data directory for caching
        const frontendDataPath = join(process.cwd(), "server", "data", "omnispectrum.json");
        writeFileSync(frontendDataPath, JSON.stringify(jsonData, null, 2));
        
        return jsonData;
      }
    }

    return null;
  } catch (error) {
    console.error("⚠️ Backend inference failed:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trigger backend inference and return fresh data
  app.post("/api/omnispectrum/refresh", async (req, res) => {
    try {
      console.log("📡 Refresh request received");
      const data = await runBackendInference();
      
      if (data) {
        res.setHeader("Content-Type", "application/json");
        res.json({ 
          success: true, 
          message: "Inference completed",
          data 
        });
      } else {
        // Fall back to cached data
        const dataPath = join(process.cwd(), "server", "data", "omnispectrum.json");
        if (existsSync(dataPath)) {
          const cachedData = readFileSync(dataPath, "utf-8");
          const jsonData = JSON.parse(cachedData);
          res.json({ 
            success: false,
            message: "Inference failed, returning cached data",
            data: jsonData
          });
        } else {
          res.status(500).json({ 
            error: "No data available",
            message: "Backend inference failed and no cached data found"
          });
        }
      }
    } catch (error) {
      console.error("Error in refresh endpoint:", error);
      res.status(500).json({ 
        error: "Refresh failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Serve omnispectrum market data (cached)
  app.get("/api/omnispectrum", (req, res) => {
    try {
      const dataPath = join(process.cwd(), "server", "data", "omnispectrum.json");
      const data = readFileSync(dataPath, "utf-8");
      const jsonData = JSON.parse(data);
      
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
      res.json(jsonData);
    } catch (error) {
      console.error("Error reading omnispectrum data:", error);
      res.status(500).json({ 
        error: "Failed to load market data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    try {
      const dataPath = join(process.cwd(), "server", "data", "omnispectrum.json");
      const hasData = existsSync(dataPath);
      res.json({
        status: "ok",
        hasData,
        backendPath: join(process.cwd(), "..", "..", "omnispectrum-backend")
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
