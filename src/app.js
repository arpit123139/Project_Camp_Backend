import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Basic Configuration
app.use(express.json({ limit: "16kb" })); // Suporting JSON Data to be sent
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // supporting data to be sent in the url
app.use(express.static("public"));
app.use(cookieParser());

// Cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//import the routes
import healthCheckRouter from "./routes/healcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Welcome to campy");
});

export default app;
