import express from "express";
import cors from "cors";

const app = express();

// Basic Configuration
app.use(express.json({ limit: "16kb" })); // Suporting JSON Data to be sent
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // supporting data to be sent in the url
app.use(express.static("public"));

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

app.use("/api/v1/healthcheck", healthCheckRouter);

app.get("/", (req, res) => {
  res.send("Welcome to campy");
});

export default app;
