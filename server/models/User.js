import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePicture: { type: String, default: null }, // Store base64 image or URL
  reviewsCount: { type: Number, default: 0 },
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

export default mongoose.model('User', userSchema);
