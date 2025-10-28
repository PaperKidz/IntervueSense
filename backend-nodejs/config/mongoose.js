// config/mongoose.js
const mongoose = require('mongoose');

const connectMongoose = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/VirtueSense';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Mongoose connected for Progress tracking');
  } catch (err) {
    console.error('❌ Mongoose connection error:', err.message);
  }
};

module.exports = { connectMongoose };
