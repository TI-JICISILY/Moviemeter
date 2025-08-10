# Environment Variables Setup Guide

## Required Environment Variables

### For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/moviemeter?retryWrites=true&w=majority
```

### For JWT Authentication:
```
JWT_SECRET=your-super-secret-jwt-key-2024
```

### For Environment:
```
NODE_ENV=production
```

### For Server:
```
PORT=5000
```

### For CORS (Cross-Origin):
```
CLIENT_ORIGIN=https://your-frontend-domain.netlify.app
LOCAL_ORIGIN=http://localhost:3000
```

## How to Set in Render:

1. Go to your Render dashboard
2. Select your MovieMeter service
3. Click "Environment" tab
4. Add each variable with its value
5. Click "Save Changes"
6. Your service will automatically redeploy

## MongoDB Atlas Setup Steps:

1. **Create Account**: Go to mongodb.com/atlas
2. **Create Cluster**: Choose FREE tier
3. **Database Access**: Create user with read/write permissions
4. **Network Access**: Allow access from anywhere (0.0.0.0/0)
5. **Get Connection String**: From "Connect" button
6. **Replace Placeholders**: `<username>` and `<password>`

## Testing Locally:

Create a `server/.env` file with the same variables to test locally.
