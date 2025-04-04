import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import connectDB from './config/db'; // Import connectDB

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Basic Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set various HTTP headers for security
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body, limit size
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter); // Apply rate limiting to all API routes

// Simple Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app; // Export for testing purposes 