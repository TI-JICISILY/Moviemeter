import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  const { movieId, movieTitle, rating, comment } = req.body;

  try {
    const review = await Review.create({
      userId: req.user.id,
      movieId,
      movieTitle,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create review', details: err });
  }
});

// Get reviews by movie ID
router.get('/:movieId', async (req, res) => {
  const reviews = await Review.find({ movieId: req.params.movieId });
  res.json(reviews);
});

// Get reviews by logged-in user
router.get('/user', auth, async (req, res) => {
  const reviews = await Review.find({ userId: req.user.id });
  res.json(reviews);
});

// Update review
router.put('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (review.userId.toString() !== req.user.id) return res.sendStatus(403);

  review.rating = req.body.rating;
  review.comment = req.body.comment;
  await review.save();

  res.json(review);
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (review.userId.toString() !== req.user.id) return res.sendStatus(403);

  await review.deleteOne();
  res.json({ message: 'Review deleted' });
});

export default router;
