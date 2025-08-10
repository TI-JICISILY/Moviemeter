# MovieMeter 🎬

A full-stack movie review application built with React, Node.js, Express, and MongoDB.

## Features

- 🔍 Search movies using OMDB API
- ⭐ Rate and review movies
- 👤 User authentication and profiles
- 📱 Responsive design
- 🔒 Secure JWT authentication
- 📊 User review history

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MovieMeter
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/moviemeter
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_ORIGIN=https://your-app.netlify.app
   LOCAL_ORIGIN=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```

   Create `.env` file in the `client` directory:
   ```env
   REACT_APP_API_BASE=http://localhost:5000
   ```

## Running the Application

### Option 1: Run Both Frontend and Backend Together
```bash
npm run dev
```
This will start both the server (port 5000) and client (port 3000) simultaneously.

### Option 2: Run Separately

**Start the backend server:**
```bash
npm run server
# or
cd server && npm run dev
```

**Start the frontend client:**
```bash
npm run client
# or
cd client && npm start
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

## Project Structure

```
MovieMeter/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── package.json
└── package.json          # Root package.json
```

## Recent Fixes Applied

1. **JWT Token Handling**: Fixed Bearer token format support
2. **Error Handling**: Added comprehensive error handling and logging
3. **Input Validation**: Added validation for all endpoints
4. **Security**: Improved authentication and authorization
5. **Response Consistency**: Standardized API responses
6. **Database Operations**: Added proper error handling for MongoDB operations
7. **Route Order**: Fixed route parameter conflicts
8. **Payload Size**: Added proper handling for large request bodies
9. **Environment Configuration**: Added proper .env files for both client and server

## Troubleshooting

### Common Issues

1. **"Missing script: dev" error**
   - Make sure you're in the correct directory
   - Run `npm run dev` from the root directory, not from client or server

2. **MongoDB connection error**
   - Ensure MongoDB is running locally or update MONGO_URI in server/.env
   - For MongoDB Atlas, use the connection string from your cluster

3. **CORS errors**
   - Check that CLIENT_ORIGIN and LOCAL_ORIGIN are set correctly in server/.env
   - Ensure the frontend is running on the correct port

4. **API calls failing**
   - Verify REACT_APP_API_BASE is set correctly in client/.env
   - Check that the backend server is running on port 5000

### Development Tips

- Use `npm run dev` to start both frontend and backend simultaneously
- Check the browser console and server logs for detailed error messages
- The server includes a health check endpoint at `http://localhost:5000/health`

## License

ISC
