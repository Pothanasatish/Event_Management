const dns = require('dns');
// Set public fallback DNS servers so SRV lookups work reliably on networks with restrictive local DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017')) {
    // If user hasn't provided a custom cloud connection string yet, test connection with a short timeout
    try {
      await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/eventhub', {
        serverSelectionTimeoutMS: 2000,
      });
      isConnected = true;
      console.log(`✓ [Database] Connected to MongoDB at: ${mongoose.connection.host}`);
    } catch (err) {
      console.warn('⚠️ [Database] Standalone MongoDB is currently offline.');
      console.warn('👉 Ready for your MongoDB connection string! Once provided in server/.env, EventHub will connect immediately.');
    }
  } else {
    // Custom MongoDB URI provided (e.g. MongoDB Atlas)
    try {
      console.log('🔄 [Database] Connecting to provided MongoDB URI...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`✓ [Database] Connected successfully to MongoDB at: ${mongoose.connection.host}`);
    } catch (err) {
      console.error(`✗ [Database] Could not connect to MongoDB URI (${err.message})`);
    }
  }
};

const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
    }
  } catch (e) {
    console.error('Error disconnecting DB:', e);
  }
};

module.exports = { connectDB, disconnectDB, isConnected: () => isConnected };
