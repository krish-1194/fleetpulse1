import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/*
 * Ensure dotenv.config() is called early in your server's entry point (e.g., server.js)
 * to load environment variables from .env before this file is imported.
 */
const config = {
  jwtSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET, // Add refresh token secret
}

if (!config.jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file or ensure dotenv is loaded.');
  process.exit(1); // Exit the application if the secret is missing
}

if (!config.refreshTokenSecret) {
  console.error('FATAL ERROR: REFRESH_TOKEN_SECRET is not defined. Please set it in your .env file.');
  process.exit(1); // Exit if refresh token secret is missing
}

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const accessToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, config.refreshTokenSecret, { expiresIn: '7d' });

    // Hash the refresh token before saving to the database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // Set refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ message: 'User registered successfully', accessToken });
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

    const accessToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, config.refreshTokenSecret, { expiresIn: '7d' });

    // Hash the refresh token before saving to the database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // Set refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber, // Include phoneNumber
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateUserProfile = async (req, res) => {
  const { username, phoneNumber, password } = req.body; // Add phoneNumber to destructuring

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
        user.username = username;
      }
      if (phoneNumber !== undefined) {
        user.phoneNumber = phoneNumber; // Update phoneNumber
      }
      if (password) {
        user.password = password;
      }
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber, // Include phoneNumber in response
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.status(401).json({ message: 'Unauthorized: No Refresh Token' });

  const refreshToken = cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

    const foundUser = await User.findById(decoded.id);
    if (!foundUser) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(403).json({ message: 'Forbidden: User not found with refresh token' });
    }

    const match = await bcrypt.compare(refreshToken, foundUser.refreshToken);
    if (!match) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(403).json({ message: 'Forbidden: Invalid Refresh Token' });
    }

    const accessToken = jwt.sign({ id: foundUser._id }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ accessToken });

  } catch (error) {
    console.error(error);
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return res.status(403).json({ message: 'Forbidden: Invalid or expired Refresh Token' });
  }
};

export const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); // No content to send back

  const refreshToken = cookies.refreshToken;

  // Check if refresh token is in DB
  const foundUser = await User.findOne({ refreshToken: { $ne: null } }); // Find a user with a non-null refresh token

  if (foundUser) {
    const match = await bcrypt.compare(refreshToken, foundUser.refreshToken);
    if (!match) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.sendStatus(204); // Forbidden: Invalid Refresh Token but no user to clear from
    }

    // Clear refresh token in DB
    foundUser.refreshToken = null;
    await foundUser.save();
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ message: 'Logged out successfully' });
};