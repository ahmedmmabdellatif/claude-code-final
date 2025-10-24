# Railway Deployment Guide

## ✅ Pre-Deployment Checklist

The following have been completed:
- ✅ Claude AI integration with Anthropic SDK
- ✅ Supabase production database configured
- ✅ Cloudinary cloud storage configured
- ✅ Server configured to use PORT environment variable
- ✅ Git repository initialized
- ✅ Build and deployment scripts added
- ✅ Procfile created

## 📦 Deployment Steps

### Option 1: Deploy via Railway Web UI (Recommended)

#### Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name: `fitness-coaching-platform` (or your choice)
   - Privacy: Private (recommended for production)
   - Don't initialize with README, .gitignore, or license

2. Push your local repository to GitHub:
   ```bash
   cd /c/Users/ZanTouH/Desktop/rork-complete-fitness-app-main/rork-complete-fitness-app-main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Deploy to Railway

1. Go to https://railway.app and sign in (or create an account)

2. Click "New Project"

3. Select "Deploy from GitHub repo"

4. Authorize Railway to access your GitHub account

5. Select your `fitness-coaching-platform` repository

6. Railway will automatically detect the configuration from your Procfile

#### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
# Database - Supabase (Production)
DATABASE_URL=your_supabase_database_url_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloud Storage - Cloudinary
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI - Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-sonnet-4-20250514

# JWT
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# App Environment
NODE_ENV=production
```

**Note**: Copy your actual credentials from your local `.env` file into Railway's environment variables dashboard.

⚠️ **Important**: Do NOT add the `PORT` variable - Railway sets this automatically!

#### Step 4: Deploy

1. Railway will automatically deploy after you add the environment variables

2. Wait for deployment to complete (usually 2-5 minutes)

3. Once deployed, Railway will provide a public URL like:
   ```
   https://your-app-name.up.railway.app
   ```

4. Test your API by visiting:
   ```
   https://your-app-name.up.railway.app
   ```
   You should see: `{"status":"ok","message":"API is running"}`

5. Test the tRPC endpoint:
   ```
   https://your-app-name.up.railway.app/api/trpc
   ```

### Option 2: Deploy via Railway CLI

If you prefer using the CLI:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   cd /c/Users/ZanTouH/Desktop/rork-complete-fitness-app-main/rork-complete-fitness-app-main
   railway init
   ```

4. Set environment variables:
   ```bash
   railway variables set DATABASE_URL="postgresql://postgres:SSFitness2025@db.yoovnfipnlrhcefnqfpz.supabase.co:5432/postgres"
   # ... (set all other variables)
   ```

5. Deploy:
   ```bash
   railway up
   ```

## 📱 Update Mobile App

After deployment, update the mobile app to use the production URL:

1. Open `.env` file in the project root

2. Update the API URL:
   ```env
   EXPO_PUBLIC_RORK_API_BASE_URL="https://your-app-name.up.railway.app"
   ```

3. Restart your Expo development server:
   ```bash
   npm run start
   ```

4. Test the app - it should now connect to the production backend!

## 🧪 Testing

### Test Backend Health
```bash
curl https://your-app-name.up.railway.app
```

Expected response:
```json
{"status":"ok","message":"API is running"}
```

### Test Authentication
Use your test credentials:
- **Coach**: `coach@test.com` / `password123`
- **Client**: `client@test.com` / `password123`

### Test Claude AI Integration
Try creating a new client through the coach dashboard or triggering plan generation.

## 🔍 Monitoring

- **Railway Dashboard**: Monitor logs, metrics, and deployments
- **Logs**: View real-time logs in Railway dashboard → Deployments → Logs
- **Metrics**: View CPU, memory, and network usage

## 🚨 Troubleshooting

### Deployment Failed
- Check Railway logs for error messages
- Verify all environment variables are set correctly
- Ensure DATABASE_URL is accessible from Railway

### App Can't Connect
- Verify the production URL in mobile app `.env`
- Check CORS settings in `backend/hono.ts`
- Ensure Railway service is running

### Database Errors
- Verify DATABASE_URL is correct
- Run Prisma generate: `npm run build`
- Check if Supabase database is accessible

### AI Features Not Working
- Verify ANTHROPIC_API_KEY is set correctly
- Check Claude API quotas and rate limits
- Review logs for AI service errors

## 📝 Post-Deployment

1. **Seed the Database** (if not already done):
   ```bash
   npm run seed
   ```

2. **Test All Features**:
   - User authentication (coach & client)
   - Create client functionality
   - AI plan generation
   - File uploads (Cloudinary)
   - Messaging
   - Notifications

3. **Monitor Performance**:
   - Check Railway dashboard for any issues
   - Monitor Claude API usage
   - Check Supabase database performance

## 🎉 Success!

Once deployed, your fitness coaching platform is live at:
```
https://your-app-name.up.railway.app
```

Your mobile app (via Expo Go) can now connect to this production backend for real testing!

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Claude AI Docs**: https://docs.anthropic.com

---

**Status**: Ready for deployment ✅
**Last Updated**: 2025-10-24
