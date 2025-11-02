// server.mjs
import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";

import fruits from "./routes/post.mjs";
import users from "./routes/user.mjs";
import payments from "./routes/payment.mjs";
import employee from "./routes/employee.mjs"; // ✅ added

dotenv.config();

const app = express();

// Security Middleware
app.use(express.json());
app.use(xssClean());
app.use(mongoSanitize());
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// API Routes
app.use("/post", fruits);
app.use("/user", users);
app.use("/payment", payments);
app.use("/employee", employee); // ✅ added

// Root Route
app.get("/", (req, res) => res.send("✅ Secure HTTPS API running"));

// SSL Certs
const key = fs.readFileSync("./certs/key.pem");
const cert = fs.readFileSync("./certs/cert.pem");

const httpsServer = https.createServer({ key, cert }, app);

// Redirect HTTP → HTTPS
const httpApp = express();
httpApp.get("*", (req, res) => {
  res.redirect("https://" + req.headers.host + req.url);
});

const HTTPS_PORT = process.env.HTTPS_PORT || 4433;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

// Start Servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`✅ HTTPS Server running at https://localhost:${HTTPS_PORT}`);
});

http.createServer(httpApp).listen(HTTP_PORT, () => {
  console.log(`🔁 HTTP redirect server running at http://localhost:${HTTP_PORT}`);
});
