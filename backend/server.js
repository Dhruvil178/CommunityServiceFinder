// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import chatbotRoutes from './routes/chatbot.js';
import recommendationRoutes from './routes/recommendation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/community-service-finder';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Community Service Finder API',
    version: '2.0.0',
    status: 'running',
  });
});

// API Routes
app.use('/api', authRoutes);            // /api/auth/*
app.use('/api/ngo', ngoRoutes);         // /api/ngo/*
app.use('/api', eventRoutes);           // /api/events/*
app.use('/api', profileRoutes);         // /api/profile
app.use('/api', securityRoutes);        // /api/security/*
app.use('/api/chatbot', chatbotRoutes); // /api/chatbot/chat
app.use('/api', recommendationRoutes);  // /api/recommend

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB + server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
