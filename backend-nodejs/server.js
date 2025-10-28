const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectMongoDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration - Allow requests from React frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectMongoDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'VirtueSense API is Running!',
    status: 'ok',
    version: '1.0.0'
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VirtueSense Node.js API'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 VIRTUESENSE API SERVER STARTED');
  console.log('='.repeat(70));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(70));
  console.log('\n✅ Server is ready!\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});