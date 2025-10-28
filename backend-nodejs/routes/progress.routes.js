import express from 'express';
import { getUsersCollection } from '../config/database.js';

const router = express.Router();

// Middleware to extract user ID (simplified - replace with your actual auth)
const getUserId = (req) => {
  // TODO: Extract from JWT token
  // const token = req.headers.authorization?.split(' ')[1];
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // return decoded.userId;
  
  // For now, return a test user
  return 'test-user-' + (req.headers['x-user-id'] || '123');
};

// ✅ POST /api/progress/complete - Mark section as complete
router.post('/complete', async (req, res) => {
  try {
    console.log('📥 POST /api/progress/complete');
    console.log('Body:', req.body);
    
    const { moduleId, sectionId, type, data } = req.body;
    
    // Validate required fields
    if (!moduleId || !sectionId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: moduleId, sectionId, type'
      });
    }
    
    const userId = getUserId(req);
    const usersCollection = getUsersCollection();
    
    // Create progress entry
    const progressEntry = {
      moduleId: String(moduleId),
      sectionId: String(sectionId),
      type,
      completedAt: new Date(),
      data: data || {}
    };
    
    // Check if this progress already exists
    const user = await usersCollection.findOne({ _id: userId });
    
    if (user && user.progress) {
      // Check for duplicate
      const existingIndex = user.progress.findIndex(
        p => p.moduleId === progressEntry.moduleId && 
             p.sectionId === progressEntry.sectionId && 
             p.type === progressEntry.type
      );
      
      if (existingIndex >= 0) {
        // Update existing progress
        await usersCollection.updateOne(
          { _id: userId },
          { $set: { [`progress.${existingIndex}`]: progressEntry } }
        );
        console.log('✅ Progress updated');
      } else {
        // Add new progress
        await usersCollection.updateOne(
          { _id: userId },
          { $push: { progress: progressEntry } }
        );
        console.log('✅ Progress added');
      }
    } else {
      // Create new user with progress
      await usersCollection.updateOne(
        { _id: userId },
        {
          $set: { 
            progress: [progressEntry],
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log('✅ New user created with progress');
    }
    
    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
      progress: progressEntry
    });
  } catch (error) {
    console.error('❌ Error in POST /api/progress/complete:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ✅ GET /api/progress/my - Get user's progress
router.get('/my', async (req, res) => {
  try {
    console.log('📥 GET /api/progress/my');
    
    const userId = getUserId(req);
    const usersCollection = getUsersCollection();
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user || !user.progress) {
      return res.status(200).json({
        success: true,
        progress: [] // Return empty array for new users
      });
    }
    
    console.log('✅ Progress fetched:', user.progress.length, 'items');
    
    res.status(200).json({
      success: true,
      progress: user.progress
    });
  } catch (error) {
    console.error('❌ Error in GET /api/progress/my:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ✅ GET /api/progress/module/:moduleId - Get progress for specific module
router.get('/module/:moduleId', async (req, res) => {
  try {
    console.log('📥 GET /api/progress/module/:moduleId');
    
    const { moduleId } = req.params;
    const userId = getUserId(req);
    const usersCollection = getUsersCollection();
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user || !user.progress) {
      return res.status(200).json({
        success: true,
        progress: []
      });
    }
    
    // Filter progress for this module
    const moduleProgress = user.progress.filter(
      p => p.moduleId === String(moduleId)
    );
    
    console.log('✅ Module progress fetched:', moduleProgress.length, 'items');
    
    res.status(200).json({
      success: true,
      progress: moduleProgress
    });
  } catch (error) {
    console.error('❌ Error in GET /api/progress/module/:moduleId:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;