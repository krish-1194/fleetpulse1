import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/*
 * Ensure dotenv.config() is called early in your server's entry point (e.g., server.js)
 * to load environment variables from .env before this file is imported.
 */
const config = {
  jwtSecret: process.env.JWT_SECRET,
}

if (!config.jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file or ensure dotenv is loaded.');
  process.exit(1); // Exit the application if the secret is missing
}

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getUserProfile = async (req, res) => {
  // req.user is populated by the protect middleware
  // We can send back the user's data (excluding the password, which is handled by select('-password') in middleware)
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
