import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Adapt Vercel-style handlers to Express
function vercelToExpress(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

// Dynamically import API handlers
const { default: leadsHandler } = await import("./api/leads.js");
const { default: leadsListHandler } = await import("./api/leads-list.js");

app.post("/api/leads", vercelToExpress(leadsHandler));
app.get("/api/leads-list", vercelToExpress(leadsListHandler));

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
