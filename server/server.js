import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

// Build an allow-list from env
const allowList = [
  process.env.CLIENT_ORIGIN,           // Netlify prod
  process.env.LOCAL_ORIGIN || 'http://localhost:3000', // local dev
].filter(Boolean);

// Dynamic CORS: only allow known origins
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowList.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin} not in allow-list`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',   // for Bearer token
  ],
  credentials: false,  // set to true only if you use cookies/sessions
  maxAge: 600,         // cache preflight for 10 minutes
};

// Apply CORS **before** your routes
app.use(cors(corsOptions));

// Helpful: handle OPTIONS preflights early
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowList
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MovieMeter API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      reviews: '/api/reviews'
    }
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error.message);
  
  // CORS errors
  if (error.message.includes('CORS blocked')) {
    return res.status(403).json({
      error: 'CORS Policy Violation',
      message: error.message,
      origin: req.get('Origin')
    });
  }
  
  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MovieMeter API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowList.join(', ') || 'None configured'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
