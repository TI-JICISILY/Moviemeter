import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: String,
  movieTitle: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
