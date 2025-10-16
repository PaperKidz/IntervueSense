// ============================================
// VIRTUESENSE NODE.JS SERVER
// This is your main backend that talks to Flask
// ============================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Flask AI service URL (your existing Flask server)
const FLASK_SERVICE = 'http://localhost:5000';

// Middleware
app.use(cors()); // Allow React to connect
app.use(express.json({ limit: '50mb' })); // Accept large files (videos)

// ============================================
// SIMPLE TEST ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'VirtueSense Node.js Server is Running!',
    status: 'ok'
  });
});

// ============================================
// HEALTH CHECK - Test if everything works
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    // Check if Flask is running
    const flaskResponse = await axios.get(`${FLASK_SERVICE}/api/health`, {
      timeout: 5000
    });
    
    res.json({
      nodejs: 'Connected ✅',
      flask: 'Connected ✅',
      message: 'All systems operational!'
    });
  } catch (error) {
    res.json({
      nodejs: 'Connected ✅',
      flask: 'Disconnected ❌',
      message: 'Make sure Flask server is running on port 5000'
    });
  }
});

// ============================================
// AI ROUTES - Forward to Flask
// ============================================

// 1. Emotion Analysis
app.post('/api/analyze-emotion', async (req, res) => {
  try {
    console.log('📸 Forwarding emotion analysis to Flask...');
    
    const response = await axios.post(
      `${FLASK_SERVICE}/api/analyze-emotion`,
      req.body,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 
      }
    );
    
    console.log('✅ Got response from Flask');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Flask error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'AI service unavailable. Is Flask running?' 
    });
  }
});

// 2. Audio Transcription
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    console.log('🎤 Forwarding audio transcription to Flask...');
    
    const response = await axios.post(
      `${FLASK_SERVICE}/api/transcribe-audio`,
      req.body,
      { timeout: 30000 }
    );
    
    console.log('✅ Got transcription from Flask');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Flask error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Transcription service unavailable' 
    });
  }
});

// 3. Voice Analysis
app.post('/api/analyze-voice-comprehensive', async (req, res) => {
  try {
    console.log('🎙️ Forwarding voice analysis to Flask...');
    
    const response = await axios.post(
      `${FLASK_SERVICE}/api/analyze-voice-comprehensive`,
      req.body,
      { timeout: 30000 }
    );
    
    console.log('✅ Got voice analysis from Flask');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Flask error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Voice analysis service unavailable' 
    });
  }
});

// 4. Answer Evaluation
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    console.log('🧠 Forwarding answer evaluation to Flask...');
    
    const response = await axios.post(
      `${FLASK_SERVICE}/api/evaluate-answer`,
      req.body,
      { timeout: 30000 }
    );
    
    console.log('✅ Got evaluation from Flask');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Flask error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Evaluation service unavailable' 
    });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 VIRTUESENSE NODE.JS SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📍 Node.js API: http://localhost:${PORT}`);
  console.log(`🤖 Flask Service: ${FLASK_SERVICE}`);
  console.log('='.repeat(60));
  console.log('\n✅ Server is ready to accept requests!\n');
});