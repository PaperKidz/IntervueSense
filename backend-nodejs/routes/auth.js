
const express = require('express');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../middleware/auth');
const { getUsersCollection } = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generateToken,
  validateEmail,
  validatePassword
} = require('../utils/auth');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    const emailLower = email.toLowerCase().trim();
    
    if (!validateEmail(emailLower)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters'
      });
    }

    const usersCollection = getUsersCollection();

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create new user
    const newUser = {
      email: emailLower,
      password: hashPassword(password),
      name: name.trim(),
      created_at: new Date(),
      interview_count: 0
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user_id: result.insertedId.toString()
    });

  } catch (err) {
    next(err);
  }
});

// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email, password);

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const users = getUsersCollection();
    const user = await users.findOne({ email: email.toLowerCase().trim() });
    
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const passwordMatch = comparePassword(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Profile Route
router.get('/user/profile', verifyToken, async (req, res, next) => {
  try {
    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.userId)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        interview_count: user.interview_count || 0
      }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
