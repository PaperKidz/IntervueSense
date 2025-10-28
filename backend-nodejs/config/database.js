const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
let usersCollection;
let client;

const connectMongoDB = async () => {
  try {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    
    // FIXED: Changed from 'virtuesense' to 'VirtueSense' to match existing database
    const db = client.db('VirtueSense');
    usersCollection = db.collection('users');
    
    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: VirtueSense`);
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

const closeConnection = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

module.exports = { connectMongoDB, getUsersCollection, closeConnection };