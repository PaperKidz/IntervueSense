const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectMongoDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
connectMongoDB();

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'VirtueSense API is Running!',
    status: 'ok',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
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