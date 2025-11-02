import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

const router = express.Router();
router.use(cookieParser());

//RATE LIMITING FOR LOGIN
const loginLimiter = rateLimit({
  //15 minutes 
  windowMs: 15 * 60 * 1000, 
  //3 attempts per IP
  max: 3,
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true, 
  legacyHeaders: false,   
});


//Hardcoded Employee Login
// Password: Admin@123
const EMPLOYEE_CREDENTIALS = {
  //Employee Username
  username: "Employee",
  //Hashed Password
  //Password:Admin@123
  passwordHash: "$2b$10$X3uMABH7eQOeGgFQe0tX4O2Aed0d6v4TtO2PAqRnfx1VyxVwbG6Ti", 
};

// Secret for employee JWT
const EMPLOYEE_JWT_SECRET = process.env.EMPLOYEE_JWT_SECRET || "employee_secret_key";


// Employee login
router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (username === EMPLOYEE_CREDENTIALS.username) {
    const passwordMatches = bcrypt.compareSync(password, EMPLOYEE_CREDENTIALS.passwordHash);

    if (passwordMatches) {
      // Generate JWT
      const token = jwt.sign({ username, role: "employee" }, EMPLOYEE_JWT_SECRET, { expiresIn: "1h" });

      // Send token in httpOnly cookie
      res.cookie("employeeToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000, // 1 hour
      });

      return res.status(200).json({ message: "Login successful" });
    }
  }

  return res.status(401).json({ error: "Invalid credentials" });
});


// Middleware to protect employee routes
export function checkEmployeeAuth(req, res, next) {
  const token = req.cookies.employeeToken;

  if (!token) return res.status(401).json({ error: "Access denied, token missing!" });

  try {
    const verified = jwt.verify(token, EMPLOYEE_JWT_SECRET);
    req.employee = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}


// Get all payments (protected)
router.get("/payments", checkEmployeeAuth, async (req, res) => {
  try {
    const collection = db.collection("payments");
    const payments = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Approve/Decline payment (protected)
router.patch("/:id/status", checkEmployeeAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const collection = db.collection("payments");
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Payment not found" });

    res.status(200).json({ message: `Payment ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Logout endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("employeeToken");
  res.json({ message: "Logged out successfully" });
});

export default router;
//------------------------EOF---------------------------