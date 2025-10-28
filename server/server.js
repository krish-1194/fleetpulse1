import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

// Check if JWT_SECRET is defined after dotenv has loaded
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables. Please set it in your .env file in the project root.');
  process.exit(1); // Exit the application if the secret is missing
}

// Log confirmation that environment variables are loaded (optional, remove in production)
console.log('Environment variables loaded successfully from:', envPath);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded');
console.log('PORT:', process.env.PORT);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON bodies

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
