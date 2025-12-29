import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRouter from "./routes/chatbot.js";
import recommendationRouter from './routes/recommendation.js';

dotenv.config();

const app = express(); // initialize app first

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", eventRoutes);
app.use("/api", authRoutes);
app.use("/api/chatbot", chatRouter);
app.use("/api", recommendationRouter); // now safe, app is initialized

// Test
app.get("/", (req, res) => res.send("API running..."));

// Connect DB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
