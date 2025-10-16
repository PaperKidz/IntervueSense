
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
let usersCollection;
let client;

const connectMongoDB = async () => {
  try {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db('virtuesense');
    usersCollection = db.collection('users');
    
    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const getUsersCollection = () => {
  if (!usersCollection) {
    throw new Error('Database not initialized');
  }
  return usersCollection;
};

module.exports = { connectMongoDB, getUsersCollection };
