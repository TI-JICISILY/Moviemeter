import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user });
});

// Get profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch {
    res.sendStatus(403);
  }
});

// Update profile picture
router.put('/profile/picture', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { profilePicture } = req.body;

    // Validate base64 image (basic validation)
    if (profilePicture && !profilePicture.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Limit image size (base64 string length check - roughly 1MB limit)
    if (profilePicture && profilePicture.length > 1400000) {
      return res.status(400).json({ error: 'Image too large. Please use an image under 1MB' });
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { profilePicture },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Profile picture update error:', err);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Update profile info
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
