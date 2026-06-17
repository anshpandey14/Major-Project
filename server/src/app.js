import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";

const app = express();

// basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
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

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Welcome to major-project");
});

export default app;
