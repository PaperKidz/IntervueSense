import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
let usersCollection;
let client;

const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    // Connect to virtuesense database (lowercase to match existing)
    const db = client.db('virtuesense');
    usersCollection = db.collection('users');
    
    // Skip index creation - it already exists in the database
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: virtuesense`);
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

export default connectDB;
export { getUsersCollection, closeConnection };