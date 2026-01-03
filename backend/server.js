import securityRoutes from "./routes/securityRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRouter from "./routes/chatbot.js";
import recommendationRouter from './routes/recommendation.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();

const app = express();

// ============================
// IMPROVED CORS CONFIGURATION
// ============================
app.use(cors({
  origin: '*', // Allow all origins (good for development)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", eventRoutes);
app.use("/api", authRoutes);
app.use("/api/chatbot", chatRouter);
app.use("/api", recommendationRouter);
app.use("/api", profileRoutes);

// ADD SECURITY ROUTE HERE
app.use("/api/security", securityRoutes);

// Test endpoint
app.get("/", (req, res) => res.send("Community Service Finder API is running..."));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Connect to MongoDB
connectDB();

// Start server - IMPORTANT: Bind to 0.0.0.0 to accept connections from network
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ================================
  🚀 Server running on port ${PORT}
  📱 Local:   http://localhost:${PORT}
  📱 Network: http://192.168.0.104:${PORT}
  🗄️  Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  ================================
  `);
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});