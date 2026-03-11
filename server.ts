import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("records.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    score INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/records", (req, res) => {
    try {
      const records = db.prepare("SELECT * FROM records ORDER BY created_at DESC LIMIT 50").all();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  app.post("/api/records", (req, res) => {
    const { level, score, correct_count, time_seconds } = req.body;
    console.log("Saving record:", { level, score, correct_count, time_seconds });
    try {
      const stmt = db.prepare(`
        INSERT INTO records (level, score, correct_count, time_seconds)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(level, score, correct_count, time_seconds);
      console.log("Record saved with ID:", info.lastInsertRowid);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error("Failed to save record:", error);
      res.status(500).json({ error: "Failed to save record" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
