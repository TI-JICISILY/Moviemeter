import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Input validation helper
const validateReview = (req, res, next) => {
  try {
    const { movieId, movieTitle, rating, comment } = req.body;
    
    if (!movieId || !movieTitle || !rating) {
      return res.status(400).json({ error: 'Movie ID, title, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    if (comment && comment.length > 1000) {
      return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
    }
    
    next();
  } catch (err) {
    console.error('Review validation error:', err);
    res.status(500).json({ error: 'Validation failed' });
  }
};

// Create review
router.post('/', auth, validateReview, async (req, res) => {
  try {
    const { movieId, movieTitle, rating, comment } = req.body;

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ 
      userId: req.user.id, 
      movieId 
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }

    const review = await Review.create({
      userId: req.user.id,
      movieId,
      movieTitle,
      rating,
      comment: comment || ''
    });
    
    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }
    res.status(500).json({ error: 'Failed to create review', details: err.message });
  }
});

// Get reviews by logged-in user - MUST come before /:movieId route
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// Get reviews by movie ID - MUST come after /user route
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }
    
    const reviews = await Review.find({ movieId }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Get movie reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// Update review
router.put('/:id', auth, validateReview, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment || '';
    await review.save();

    res.json(review);
  } catch (err) {
    console.error('Update review error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    res.status(500).json({ error: 'Failed to update review', details: err.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
});

export default router;
