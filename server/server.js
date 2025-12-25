import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

// Manually load and set environment variables from .env
try {
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  const lines = envFileContent.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter out empty lines
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value !== undefined && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
} catch (error) {
  console.error('Error manually loading .env file:', error);
}

// Check if JWT_SECRET is defined after dotenv has loaded
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables. Please set it in your .env file in the project root.');
  process.exit(1); // Exit the application if the secret is missing
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL ERROR: REFRESH_TOKEN_SECRET is not defined in environment variables. Please set it in your .env file in the project root.');
  process.exit(1); // Exit the application if the secret is missing
}

if (!process.env.FRONTEND_ORIGIN) {
  console.error('FATAL ERROR: FRONTEND_ORIGIN is not defined in environment variables. Please set it in your .env file in the project root.');
  process.exit(1); // Exit the application if the origin is missing
}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow both HTTP and HTTPS origins for localhost in development
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN?.replace('http://', 'https://'), // Also allow HTTPS version
  process.env.FRONTEND_ORIGIN?.replace('https://', 'http://'), // Also allow HTTP version
].filter(Boolean); // Remove any undefined values

app.use(cors({ 
  credentials: true, 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (origin.includes('localhost:5173')) {
      // For development, allow any localhost:5173 origin (HTTP or HTTPS)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json()); // Enable parsing of JSON bodies
app.use(cookieParser()); // Use cookie-parser middleware

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// Dynamically import routes AFTER dotenv config to ensure process.env is populated
const authRoutes = await import('./routes/authRoutes.js');
const vehicleRoutes = await import('./routes/vehicleRoutes.js');

app.use('/api/auth', authRoutes.default); // Mount auth routes at /api/auth
app.use('/api/vehicles', vehicleRoutes.default); // Mount vehicle routes at /api/vehicles

// Example root API route (can be removed or modified)
app.get('/api', (req, res) => res.json({ message: 'Welcome to FleetPulse API!' }));

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
