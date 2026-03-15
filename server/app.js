import authRoutes from './routes/auth.js';
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import reportRoutes from './routes/reportRoutes.js';
const app = express();
const port = process.env.PORT || 3000;
await connectDB();
 // Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({credentials:true}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Helpora Backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});