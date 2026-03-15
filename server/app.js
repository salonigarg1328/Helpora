import authRoutes from './routes/auth.js';
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from 'http';          // new
import { Server } from 'socket.io'; 
import connectDB from "./config/db.js";
import reportRoutes from './routes/reportRoutes.js';
const app = express();
const httpServer = createServer(app);          // create HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
console.log('✅ Socket.io server created');
const port = process.env.PORT || 3000;
await connectDB();
 // Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({credentials:true}));


// Make io accessible in controllers (optional)
app.set('io', io);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Helpora Backend!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id, 'transport:', socket.conn.transport.name);

  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'reason:', reason);
  });

  socket.on('connect_error', (err) => {
    console.log('❌ Connection error:', err.message);
  });
});
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});