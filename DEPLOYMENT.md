# MovieMeter Deployment Guide

## Netlify Frontend Deployment

### 1. Environment Variables
In Netlify → Site settings → Build & deploy → Environment → Edit variables:

```
REACT_APP_API_BASE = https://YOUR-BACKEND-URL
GENERATE_SOURCEMAP = false
CI = false
```

Replace `YOUR-BACKEND-URL` with your actual backend URL (e.g., Railway, Render, Heroku).

### 2. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `client/build`
- **Base directory**: `client`

### 3. Deploy Steps
1. Connect your GitHub repository to Netlify
2. Set build settings as above
3. Add environment variables
4. Deploy!

## Backend Deployment (Railway/Render/Heroku)

### 1. Environment Variables
Set these in your backend hosting platform:

```
MONGO_URI = your-mongodb-connection-string
JWT_SECRET = your-jwt-secret-key
CLIENT_ORIGIN = https://your-netlify-site.netlify.app
PORT = 5000
```

### 2. Railway Deployment
1. Connect GitHub repository
2. Select the `server` folder as root
3. Add environment variables
4. Deploy

### 3. Render Deployment
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## Post-Deployment Checklist

### ✅ Frontend (Netlify)
- [ ] Site loads without errors
- [ ] All routes work (refresh test)
- [ ] API calls go to correct backend URL
- [ ] Environment variables are set

### ✅ Backend (Railway/Render)
- [ ] API responds to requests
- [ ] Database connection works
- [ ] CORS allows frontend domain
- [ ] Environment variables are set

### ✅ Full Application
- [ ] User registration works
- [ ] User login works
- [ ] Movie search works
- [ ] Review submission works
- [ ] Profile page loads
- [ ] Profile picture upload works

## Troubleshooting

### CORS Errors
- Check `CLIENT_ORIGIN` environment variable on backend
- Verify frontend URL in CORS configuration

### 404 on Refresh
- Ensure `_redirects` file exists in `client/public/`
- Or `netlify.toml` in `client/` folder

### API Not Found
- Check `REACT_APP_API_BASE` environment variable
- Verify backend is deployed and running

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for environment-specific issues

## Security Notes

- Never commit real environment variables
- Use strong JWT secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Limit file upload sizes
