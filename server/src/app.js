import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.disable("x-powered-by");

// basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ensure temp upload folder exists
if (!fs.existsSync("./public/images")) {
  fs.mkdirSync("./public/images", { recursive: true });
}

// import the routes

import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import PatientRouter from "./routes/patient.routes.js";
import VisitRouter from "./routes/visit.routes.js";
import VaccinationRouter from "./routes/vaccination.routes.js";
import ANCRouter from "./routes/anc.routes.js";
import syncRouter from "./routes/sync.routes.js";
import aiRouter from "./routes/ai.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/patient", PatientRouter);
app.use("/api/v1/visit", VisitRouter);
app.use("/api/v1/vaccination", VaccinationRouter);
app.use("/api/v1/anc", ANCRouter);
app.use("/api/v1/sync", syncRouter);
app.use("/api/v1/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("Welcome to major-project");
});

export default app;
