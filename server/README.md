# MovieMeter Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/moviemeter

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client Origins (for CORS)
CLIENT_ORIGIN=https://your-app.netlify.app
LOCAL_ORIGIN=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/profile/picture` - Update profile picture

### Reviews
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/user` - Get user's reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

## Recent Fixes Applied

1. **JWT Token Handling**: Fixed Bearer token format support
2. **Error Handling**: Added comprehensive error handling and logging
3. **Input Validation**: Added validation for all endpoints
4. **Security**: Improved authentication and authorization
5. **Response Consistency**: Standardized API responses
6. **Database Operations**: Added proper error handling for MongoDB operations
7. **Route Order**: Fixed route parameter conflicts
8. **Payload Size**: Added proper handling for large request bodies

## Health Check
- `GET /health` - Server health status
- `GET /` - API information
