// backend-nodejs/middleware/auth.js
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Header:', authHeader); // Debug log
    
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    console.log('🎫 Token received:', token.substring(0, 20) + '...'); // Debug log
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Decoded token:', decoded); // Debug log
    
    // CRITICAL FIX: Set req.userId from decoded token
    req.userId = decoded.userId;
    
    console.log('👤 User ID set to:', req.userId); // Debug log
    
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default verifyToken;