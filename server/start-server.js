import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: [
    'https://moviemeter-y55x.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 600
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Mock data for testing
let mockReviews = [
  {
    _id: '1',
    userId: 'user123',
    movieId: 'tt1517268',
    movieTitle: 'Barbie',
    rating: 4,
    comment: 'goood',
    date: new Date('2025-08-10')
  },
  {
    _id: '2',
    userId: 'user123',
    movieId: 'tt1517268',
    movieTitle: 'Barbie',
    rating: 5,
    comment: 'good..',
    date: new Date('2025-08-10')
  }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Mock user for testing
  req.user = { id: 'user123' };
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock review routes
app.get('/api/reviews/movie/:movieId', (req, res) => {
  const { movieId } = req.params;
  const reviews = mockReviews.filter(review => review.movieId === movieId);
  res.json(reviews);
});

app.get('/api/reviews/user', mockAuth, (req, res) => {
  const userReviews = mockReviews.filter(review => review.userId === req.user.id);
  res.json(userReviews);
});

app.post('/api/reviews', mockAuth, (req, res) => {
  const { movieId, movieTitle, rating, comment } = req.body;
  
  if (!movieId || !movieTitle || !rating) {
    return res.status(400).json({ error: 'Movie ID, title, and rating are required' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  const newReview = {
    _id: Date.now().toString(),
    userId: req.user.id,
    movieId,
    movieTitle,
    rating,
    comment: comment || '',
    date: new Date()
  };
  
  mockReviews.push(newReview);
  res.status(201).json(newReview);
});

app.put('/api/reviews/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  
  const reviewIndex = mockReviews.findIndex(review => 
    review._id === id && review.userId === req.user.id
  );
  
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  mockReviews[reviewIndex] = {
    ...mockReviews[reviewIndex],
    rating,
    comment: comment || '',
    date: new Date()
  };
  
  res.json(mockReviews[reviewIndex]);
});

app.delete('/api/reviews/:id', mockAuth, (req, res) => {
  const { id } = req.params;
  
  const reviewIndex = mockReviews.findIndex(review => 
    review._id === id && review.userId === req.user.id
  );
  
  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  mockReviews.splice(reviewIndex, 1);
  res.json({ message: 'Review deleted successfully' });
});

// Mock auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      token: 'mock-jwt-token',
      user: { id: 'user123', email }
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/profile', mockAuth, (req, res) => {
  res.json({ id: req.user.id, email: 'test@example.com' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`⚠️  This is a mock server for testing - no database required`);
});
