import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load .env from backend root

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI not defined in .env file');
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 