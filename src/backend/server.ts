import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Quiet Light Aptitude Test API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 