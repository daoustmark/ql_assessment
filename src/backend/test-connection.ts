import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// MONGODB_URI is guaranteed to be defined at this point
const uri: string = MONGODB_URI;

async function testConnection() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    await mongoose.disconnect();
    console.log('✅ Successfully disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  }
}

testConnection(); 