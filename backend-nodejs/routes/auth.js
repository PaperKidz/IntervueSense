import express from 'express';
import { ObjectId } from 'mongodb';
import verifyToken from '../middleware/auth.js';
import { getUsersCollection } from '../config/database.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  validateEmail,
  validatePassword
} from '../utils/auth.js';

const router = express.Router();

// ---------------------- Signup ----------------------
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    const emailLower = email.toLowerCase().trim();

    if (!validateEmail(emailLower)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    const users = getUsersCollection();

    const existingUser = await users.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = {
      email: emailLower,
      password: hashPassword(password),
      name: name.trim(),
      created_at: new Date(),
      interview_count: 0
    };

    const result = await users.insertOne(newUser);

    const insertedUser = { ...newUser, _id: result.insertedId };
    const token = generateToken(insertedUser._id.toString());

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: insertedUser._id.toString(),
        name: insertedUser.name,
        email: insertedUser.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    next(err);
  }
});

// ---------------------- Login ----------------------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Missing email or password' });

    const users = getUsersCollection();
    const user = await users.findOne({ email: email.toLowerCase().trim() });

    if (!user)
      return res.status(401).json({ success: false, message: 'User not found' });

    const passwordMatch = comparePassword(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ success: false, message: 'Invalid password' });

    const token = generateToken(user._id.toString());

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
});

// ---------------------- Profile ----------------------
router.get('/user/profile', verifyToken, async (req, res, next) => {
  try {
    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        interview_count: user.interview_count || 0
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    next(err);
  }
});

export default router;