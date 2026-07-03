import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { connectDB } from "./db/database.js";
import { seed } from "./db/seed.js";

import carsRouter from "./routes/cars.js";
import bookingsRouter from "./routes/bookings.js";
import dashboardRouter from "./routes/dashboard.js";
import availabilityRouter from "./routes/availability.js";
import calendarRouter from "./routes/calendar.js";
import receiptRouter from "./routes/receipt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/cars", carsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/receipt", receiptRouter);

// In production, serve the built frontend (run `npm run build` in /frontend first)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(frontendDist, "index.html")));
}

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

async function start() {
  try {
    await connectDB();
    await seed();
    app.listen(PORT, () => {
      console.log(`Saurabh's Rental Car Service API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
