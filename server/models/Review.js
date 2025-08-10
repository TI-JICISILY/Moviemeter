import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required']
  },
  movieId: { 
    type: String, 
    required: [true, 'Movie ID is required'],
    trim: true
  },
  movieTitle: { 
    type: String, 
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Movie title cannot exceed 200 characters']
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

// Compound index to prevent duplicate reviews from same user for same movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Indexes for better query performance
reviewSchema.index({ movieId: 1, date: -1 });
reviewSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Review', reviewSchema);
