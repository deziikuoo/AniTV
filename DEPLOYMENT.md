# Deployment Guide - Consumet API to Render

## Prerequisites
- Render account (already created)
- Git repository with the Consumet API code

## Deployment Steps

### 1. Prepare for Deployment
The Consumet API is already set up and ready for deployment. The repository includes:
- `render.yaml` - Render configuration file
- `package.json` - Dependencies and scripts
- Environment variables configured

### 2. Deploy to Render

#### Option A: Deploy via Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `api.consumet.org` repository
5. Configure the service:
   - **Name**: `anitv-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: US East (Ashburn) - closest to Marietta, GA

#### Option B: Deploy via Git Push
1. Push your code to GitHub
2. Render will automatically detect the `render.yaml` file
3. Follow the dashboard setup

### 3. Environment Variables
Set these in Render dashboard:
- `PORT`: `3010` (Render will override this)
- `NODE_ENV`: `production`
- `REDIS_HOST`: (optional - for caching)
- `REDIS_PORT`: (optional - for caching)
- `REDIS_PASSWORD`: (optional - for caching)
- `TMDB_KEY`: (optional - for movie metadata)

### 4. Verify Deployment
Once deployed, test the endpoints:
- `https://your-app-name.onrender.com/` - Should show welcome message
- `https://your-app-name.onrender.com/anime` - Should show anime routes
- `https://your-app-name.onrender.com/movies` - Should show movie routes

**Note**: The API will run on port 3010 in production, but Render will handle the port mapping automatically.

### 5. Update Frontend Configuration
After deployment, update your frontend to use the Render URL instead of localhost.

## Troubleshooting

### Common Issues
1. **Build Failures**: Check if all dependencies are in package.json
2. **Runtime Errors**: Some anime providers may be down - this is normal
3. **Timeout Issues**: Render has a 30-second timeout for free tier

### Performance Optimization
- Enable Redis caching if needed
- Monitor usage to stay within free tier limits
- Consider upgrading to paid plan for better performance

## Next Steps
After successful deployment:
1. Test all API endpoints
2. Update frontend configuration
3. Move to Phase 1.2 - Frontend Setup
