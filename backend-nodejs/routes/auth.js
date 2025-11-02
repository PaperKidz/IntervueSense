// backend-nodejs/routes/auth.js
import express from 'express';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import verifyToken from '../middleware/auth.js';
import upload from '../middleware/upload.js';
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
      avatar: null,
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
        email: insertedUser.email,
        avatar: insertedUser.avatar,
        createdAt: insertedUser.created_at
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
        email: user.email,
        avatar: user.avatar,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
});

// ---------------------- Get Profile ----------------------
router.get('/user/profile', verifyToken, async (req, res, next) => {
  try {
    console.log('📋 Get Profile - User ID:', req.userId); // Debug log
    
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
        avatar: user.avatar,
        createdAt: user.created_at,
        interview_count: user.interview_count || 0
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    next(err);
  }
});

// ---------------------- Update Profile ----------------------
router.put('/user/profile', verifyToken, async (req, res, next) => {
  try {
    console.log('✏️  Update Profile - User ID:', req.userId); // Debug log
    console.log('✏️  Update Profile - Request body:', req.body); // Debug log
    
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name must be at least 2 characters' 
      });
    }

    // CRITICAL FIX: Check if req.userId exists
    if (!req.userId) {
      console.error('❌ req.userId is undefined!');
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }

    const users = getUsersCollection();
    
    console.log('🔍 Looking for user with ID:', req.userId);
    
    // Update the user
    await users.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          name: name.trim(), 
          updated_at: new Date() 
        } 
      }
    );

    // Fetch the updated user
    const updatedUser = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('✅ Profile updated successfully for user:', updatedUser.email);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.created_at
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    next(err);
  }
});

// ---------------------- Upload Avatar ----------------------
router.post('/user/avatar', verifyToken, upload.single('avatar'), async (req, res, next) => {
  try {
    console.log('📸 Upload Avatar - User ID:', req.userId); // Debug log
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // CRITICAL FIX: Check if req.userId exists
    if (!req.userId) {
      console.error('❌ req.userId is undefined!');
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }

    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      // Delete uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join('uploads', user.avatar.replace('/uploads/', ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path (relative to uploads folder)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update the user document
    await users.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          avatar: avatarUrl,
          updated_at: new Date() 
        } 
      }
    );

    // Fetch the updated user
    const updatedUser = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found after update' });
    }

    console.log('✅ Avatar uploaded successfully for user:', updatedUser.email);

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: updatedUser.avatar,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.created_at
      }
    });
  } catch (err) {
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Avatar upload error:', err);
    next(err);
  }
});

// ---------------------- Delete Avatar ----------------------
router.delete('/user/avatar', verifyToken, async (req, res, next) => {
  try {
    console.log('🗑️  Delete Avatar - User ID:', req.userId); // Debug log
    
    // CRITICAL FIX: Check if req.userId exists
    if (!req.userId) {
      console.error('❌ req.userId is undefined!');
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }

    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.avatar) {
      return res.status(400).json({ 
        success: false, 
        message: 'No avatar to delete' 
      });
    }

    // Delete avatar file
    const avatarPath = path.join('uploads', user.avatar.replace('/uploads/', ''));
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    // Update user record
    await users.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          avatar: null,
          updated_at: new Date() 
        } 
      }
    );

    console.log('✅ Avatar deleted successfully for user:', user.email);

    return res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (err) {
    console.error('Avatar deletion error:', err);
    next(err);
  }
});

// ---------------------- Change Password ----------------------
router.put('/user/password', verifyToken, async (req, res, next) => {
  try {
    console.log('🔒 Change Password - User ID:', req.userId); // Debug log
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be different from current password' 
      });
    }

    // CRITICAL FIX: Check if req.userId exists
    if (!req.userId) {
      console.error('❌ req.userId is undefined!');
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }

    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = comparePassword(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const hashedNewPassword = hashPassword(newPassword);
    await users.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          password: hashedNewPassword, 
          updated_at: new Date() 
        } 
      }
    );

    console.log('✅ Password changed successfully for user:', user.email);

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err);
    next(err);
  }
});

// ---------------------- Delete Account ----------------------
router.delete('/user/account', verifyToken, async (req, res, next) => {
  try {
    console.log('⚠️  Delete Account - User ID:', req.userId); // Debug log
    
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required to delete account' 
      });
    }

    // CRITICAL FIX: Check if req.userId exists
    if (!req.userId) {
      console.error('❌ req.userId is undefined!');
      return res.status(401).json({ success: false, message: 'User ID not found in token' });
    }

    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    // Delete avatar if exists
    if (user.avatar) {
      const avatarPath = path.join('uploads', user.avatar.replace('/uploads/', ''));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Delete user
    await users.deleteOne({ _id: new ObjectId(req.userId) });

    console.log('⚠️  Account deleted for user:', user.email);

    // TODO: Also delete user's interview data from progress collection if exists
    // const progress = getProgressCollection();
    // await progress.deleteMany({ userId: req.userId });

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    console.error('Account deletion error:', err);
    next(err);
  }
});

export default router;