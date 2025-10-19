const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const FLASK_SERVICE = process.env.FLASK_SERVICE || 'http://localhost:5000';

// Helper function to forward requests to Flask
const forwardToFlask = async (endpoint, data) => {
  try {
    const response = await axios.post(
      `${FLASK_SERVICE}${endpoint}`,
      data,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Flask service error: ${error.message}`);
  }
};

// Health Check
router.get('/health', async (req, res, next) => {
  try {
    const flaskHealth = await axios.get(`${FLASK_SERVICE}/api/health`, { timeout: 5000 });
    
    res.json({
      nodejs: 'Connected ✅',
      flask: 'Connected ✅',
      message: 'All systems operational'
    });
  } catch (err) {
    res.json({
      nodejs: 'Connected ✅',
      flask: 'Disconnected ❌',
      message: 'Flask service unavailable'
    });
  }
});

// Emotion Analysis
router.post('/analyze-emotion', verifyToken, async (req, res, next) => {
  try {
    console.log('📸 Processing emotion analysis...');
    const result = await forwardToFlask('/api/analyze-emotion', req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Audio Transcription
router.post('/transcribe-audio', verifyToken, async (req, res, next) => {
  try {
    console.log('🎤 Processing audio transcription...');
    const result = await forwardToFlask('/api/transcribe-audio', req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Voice Analysis
router.post('/analyze-voice-comprehensive', verifyToken, async (req, res, next) => {
  try {
    console.log('🎙️ Processing voice analysis...');
    const result = await forwardToFlask('/api/analyze-voice-comprehensive', req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Answer Evaluation
router.post('/evaluate-answer', verifyToken, async (req, res, next) => {
  try {
    console.log('🧠 Processing answer evaluation...');
    const result = await forwardToFlask('/api/evaluate-answer', req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;