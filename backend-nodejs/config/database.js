import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
let usersCollection;
let client;

const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    // Connect to VirtueSense database
    const db = client.db('VirtueSense');
    usersCollection = db.collection('users');
    
    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: VirtueSense`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const getUsersCollection = () => {
  if (!usersCollection) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return usersCollection;
};

const closeConnection = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// ✅ ES6 default export
export default connectDB;

// ✅ Named exports
export { getUsersCollection, closeConnection };