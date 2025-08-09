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
LOCAL_ORIGIN = http://localhost:3000
PORT = 5000
NODE_ENV = production
```

**Important:** 
- `CLIENT_ORIGIN` must match your Netlify URL exactly (https, no trailing slash)
- `LOCAL_ORIGIN` is optional for local development
- Make sure there are no typos in your URLs

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
**"CORS blocked" in browser console:**
1. Check `CLIENT_ORIGIN` environment variable on backend matches Netlify URL exactly
2. Ensure no trailing slash in URLs
3. Verify backend is redeployed after environment variable changes
4. Check browser DevTools → Network → Headers for the exact origin being sent

**Test CORS Configuration:**
```bash
# Check if your API allows your frontend origin
curl -H "Origin: https://your-netlify-site.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/auth/profile
```

### 404 on Refresh
- Ensure `_redirects` file exists in `client/public/`
- Or `netlify.toml` in `client/` folder with redirects configuration

### API Not Found / 401 Unauthorized
- Check `REACT_APP_API_BASE` environment variable on Netlify
- Verify backend is deployed and accessible at `/health` endpoint
- Ensure tokens are being sent with requests

### Build Failures
- Check Node.js version compatibility (use Node 18+ recommended)
- Verify all dependencies are installed
- Check for environment-specific issues
- Clear Netlify cache: Deploys → Trigger deploy → Clear cache and deploy

### Health Check
**Test your API health:**
- Visit: `https://your-backend-url.onrender.com/health`
- Should return: `{"ok": true, "timestamp": "...", "allowedOrigins": [...]}`

### Common Issues
1. **Wrong URL format**: Use `https://` not `http://` for production
2. **Trailing slashes**: Remove them from environment variables
3. **Case sensitivity**: Environment variable names are case-sensitive
4. **Cache issues**: Clear browser cache and Netlify deploy cache

## Security Notes

- Never commit real environment variables
- Use strong JWT secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Limit file upload sizes
