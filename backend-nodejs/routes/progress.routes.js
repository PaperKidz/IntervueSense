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
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { moduleId, sectionId, type, data } = req.body;
    
    // ✅ Enhanced validation
    if (!moduleId) {
      console.error('❌ Missing moduleId');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: moduleId'
      });
    }
    
    if (!sectionId) {
      console.error('❌ Missing sectionId');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sectionId'
      });
    }
    
    if (!type) {
      console.error('❌ Missing type');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: type'
      });
    }
    
    // ✅ Validate type
    if (!['theory', 'practice'].includes(type)) {
      console.error('❌ Invalid type:', type);
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "theory" or "practice"'
      });
    }
    
    // ✅ For practice, validate practiceId exists
    if (type === 'practice' && !data?.practiceId) {
      console.error('❌ Missing practiceId for practice type');
      return res.status(400).json({
        success: false,
        error: 'Missing practiceId in data for practice type'
      });
    }
    
    const userId = getUserId(req);
    console.log('👤 User ID:', userId);
    
    const usersCollection = getUsersCollection();
    
    if (!usersCollection) {
      console.error('❌ Database collection not available');
      return res.status(500).json({
        success: false,
        error: 'Database connection error'
      });
    }
    
    // Create progress entry
    const progressEntry = {
      moduleId: String(moduleId),
      sectionId: String(sectionId),
      type,
      completedAt: new Date(),
      data: data || {}
    };
    
    // For practice questions, ensure practiceId is stored
    if (type === 'practice' && data?.practiceId) {
      progressEntry.data.practiceId = String(data.practiceId);
    }
    
    console.log('📝 Progress entry to save:', JSON.stringify(progressEntry, null, 2));
    
    // Check if this progress already exists
    const user = await usersCollection.findOne({ _id: userId });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (user && user.progress) {
      // Check for duplicate
      let existingIndex = -1;
      
      if (type === 'practice') {
        // For practice, match by module, section, type AND practiceId
        existingIndex = user.progress.findIndex(
          p => p.moduleId === progressEntry.moduleId && 
               p.sectionId === progressEntry.sectionId && 
               p.type === progressEntry.type &&
               String(p.data?.practiceId || '') === String(data.practiceId || '')
        );
      } else {
        // For theory, match by module, section, and type
        existingIndex = user.progress.findIndex(
          p => p.moduleId === progressEntry.moduleId && 
               p.sectionId === progressEntry.sectionId && 
               p.type === progressEntry.type
        );
      }
      
      if (existingIndex >= 0) {
        console.log('🔄 Updating existing progress at index:', existingIndex);
        // Update existing progress
        await usersCollection.updateOne(
          { _id: userId },
          { $set: { [`progress.${existingIndex}`]: progressEntry } }
        );
        console.log('✅ Progress updated');
      } else {
        console.log('➕ Adding new progress entry');
        // Add new progress
        await usersCollection.updateOne(
          { _id: userId },
          { $push: { progress: progressEntry } }
        );
        console.log('✅ Progress added');
      }
    } else {
      console.log('👤 Creating new user with progress');
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET /api/progress/my - Get user's progress
router.get('/my', async (req, res) => {
  try {
    console.log('📥 GET /api/progress/my');
    
    const userId = getUserId(req);
    console.log('👤 User ID:', userId);
    
    const usersCollection = getUsersCollection();
    
    if (!usersCollection) {
      console.error('❌ Database collection not available');
      return res.status(500).json({
        success: false,
        error: 'Database connection error'
      });
    }
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user || !user.progress) {
      console.log('ℹ️  No progress found for user');
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET /api/progress/module/:moduleId - Get progress for specific module
router.get('/module/:moduleId', async (req, res) => {
  try {
    console.log('📥 GET /api/progress/module/:moduleId');
    
    const { moduleId } = req.params;
    const userId = getUserId(req);
    console.log('👤 User ID:', userId);
    console.log('📦 Module ID:', moduleId);
    
    const usersCollection = getUsersCollection();
    
    if (!usersCollection) {
      console.error('❌ Database collection not available');
      return res.status(500).json({
        success: false,
        error: 'Database connection error'
      });
    }
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user || !user.progress) {
      console.log('ℹ️  No progress found for user');
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/reset', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Progress reset is only allowed in development mode'
      });
    }

    const userId = getUserId(req);
    console.log('🧹 Resetting progress for user:', userId);

    const usersCollection = getUsersCollection();
    if (!usersCollection) {
      return res.status(500).json({ success: false, error: 'Database connection error' });
    }

    // ✅ Remove progress field entirely
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $unset: { progress: "" } } // removes progress array cleanly
    );

    if (result.modifiedCount === 0) {
      console.log('⚠️ No progress found or already empty');
      return res.json({ success: true, message: 'No progress to reset' });
    }

    console.log('✅ Progress reset successful');
    res.json({ success: true, message: 'Progress reset successfully' });
  } catch (error) {
    console.error('❌ Error in DELETE /api/progress/reset:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
export default router;