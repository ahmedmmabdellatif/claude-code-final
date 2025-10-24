# ☁️ Cloud Storage Setup Guide

## Overview

Your app has a flexible storage adapter that supports AWS S3, Cloudinary, or mock storage. This guide helps you set up real cloud storage for production file uploads.

---

## Quick Comparison

| Provider | Best For | Free Tier | Setup Time |
|----------|----------|-----------|------------|
| **Cloudinary** | Images & Videos | 25GB storage, 25GB bandwidth/month | 5 minutes |
| **AWS S3** | All file types | 5GB storage, 20K requests/month (12 months) | 15 minutes |
| **Mock** | Development | Unlimited (doesn't store files) | Already set up |

---

## Option 1: Cloudinary (Recommended) ☁️

### Why Cloudinary?
- ✅ Easiest setup
- ✅ Automatic image optimization
- ✅ Video transformation support
- ✅ CDN included
- ✅ Generous free tier
- ✅ Perfect for fitness app (photos/videos)

### Setup Steps

#### 1. Create Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up (free account)
3. Verify email

#### 2. Get Credentials
1. Go to Dashboard
2. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

#### 3. Install Package
```bash
bun add cloudinary
```

#### 4. Configure Environment
Add to `.env`:
```env
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

#### 5. Test Upload
Upload a progress photo or exercise video in the app. Check your Cloudinary dashboard to see the file.

### Features Enabled
- Progress photos stored permanently
- Exercise videos with automatic compression
- Form check videos from clients
- Meal plan images
- Profile photos

---

## Option 2: AWS S3 📦

### Why AWS S3?
- ✅ Industry standard
- ✅ Unlimited scalability
- ✅ Very low cost at scale
- ✅ Full control over bucket policies
- ✅ Integration with other AWS services

### Setup Steps

#### 1. Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create free tier account
3. Verify identity (may require credit card)

#### 2. Create S3 Bucket
```bash
# Using AWS Console:
1. Go to S3 service
2. Click "Create bucket"
3. Choose name (e.g., "fitness-app-uploads")
4. Select region (e.g., "us-east-1")
5. Uncheck "Block all public access" (we need public-read)
6. Create bucket
```

#### 3. Create IAM User
```bash
# In AWS Console:
1. Go to IAM service
2. Users → Add user
3. Name: "fitness-app-uploader"
4. Access type: Programmatic access
5. Permissions: Attach "AmazonS3FullAccess" policy
6. Copy Access Key ID and Secret Access Key
```

#### 4. Install Package
```bash
bun add @aws-sdk/client-s3
```

#### 5. Configure Environment
Add to `.env`:
```env
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_secret_access_key"
AWS_S3_BUCKET="fitness-app-uploads"
AWS_S3_REGION="us-east-1"
```

#### 6. Set Bucket Policy (Optional - for public URLs)
In S3 bucket → Permissions → Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fitness-app-uploads/*"
    }
  ]
}
```

#### 7. Test Upload
Upload a file in the app. Check S3 console to see the file.

### Features Enabled
- Same as Cloudinary
- Additional: Document uploads (PDFs, etc.)
- Custom bucket policies for security

---

## Option 3: Mock Storage (Default) 🧪

### Current Setup
- ✅ Already configured
- ✅ No installation needed
- ✅ Perfect for development
- ✅ No external dependencies

### Limitations
- ❌ Files not actually stored
- ❌ URLs are fake
- ❌ Data lost on restart
- ❌ Can't view uploaded files

### When to Use
- Local development
- Testing without internet
- Before production deployment

### Configuration
```env
STORAGE_PROVIDER="mock"
# No other credentials needed
```

---

## Migration Guide

### From Mock to Real Storage

**Step 1: Choose Provider** (Cloudinary recommended)

**Step 2: Install Package**
```bash
# For Cloudinary
bun add cloudinary

# For S3
bun add @aws-sdk/client-s3
```

**Step 3: Update .env**
```env
# Before
STORAGE_PROVIDER="mock"

# After (Cloudinary)
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Or (S3)
STORAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_S3_BUCKET="your_bucket"
AWS_S3_REGION="us-east-1"
```

**Step 4: Restart Server**
```bash
bun run start
```

**Step 5: Test**
Upload a file in the app. Verify it appears in your storage dashboard.

---

## Testing Checklist

### Upload Test
- [ ] Go to onboarding and upload photos
- [ ] Check storage dashboard for files
- [ ] Verify URLs are accessible
- [ ] Files appear in app

### Delete Test
- [ ] Delete uploaded files in app
- [ ] Verify files removed from storage
- [ ] Database records cleaned up

### Types Test
- [ ] Upload image (.jpg, .png)
- [ ] Upload video (.mp4, .mov)
- [ ] Verify correct MIME types

---

## Cost Estimates

### Cloudinary Free Tier
- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25 credits/month

**Sufficient for:**
- 100-200 users
- 50-100 uploads per day
- ~6 months before upgrade needed

### AWS S3 Free Tier (12 months)
- **Storage:** 5 GB
- **Requests:** 20,000 GET, 2,000 PUT
- **Data Transfer:** 15 GB/month

**After free tier:**
- Storage: $0.023/GB/month
- Requests: $0.0004 per 1,000 requests
- **Very affordable at scale**

### Paid Pricing Comparison

| Usage | Cloudinary | AWS S3 |
|-------|-----------|---------|
| 100 GB storage | $55/month | $2.30/month |
| 100 GB bandwidth | $99/month | $9/month |
| 1M transformations | $995/month | N/A |

**Winner:** S3 for cost, Cloudinary for features

---

## Troubleshooting

### Issue: "Cannot find module 'cloudinary'"
**Fix:** Install package
```bash
bun add cloudinary
```

### Issue: "Invalid credentials"
**Fix:** Check .env values, ensure no extra spaces
```env
# Wrong
CLOUDINARY_API_KEY=" your_key "

# Correct
CLOUDINARY_API_KEY="your_key"
```

### Issue: "Access Denied" (S3)
**Fix:** Check IAM permissions, ensure S3FullAccess attached

### Issue: Files upload but can't view
**Fix:** Make S3 bucket public or add bucket policy (see setup above)

### Issue: Mock storage still being used
**Fix:** Verify `STORAGE_PROVIDER` in .env and restart server

---

## Security Best Practices

### 1. Never Commit Credentials
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Use Environment Variables
```typescript
// Good
const apiKey = process.env.CLOUDINARY_API_KEY;

// Bad - hardcoded
const apiKey = "123456789";
```

### 3. Restrict S3 Bucket Access
- Only allow necessary permissions
- Use IAM roles in production
- Enable versioning for backups

### 4. Validate File Types
```typescript
// Already implemented in upload route
const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
if (!validTypes.includes(mimeType)) {
  throw new Error('Invalid file type');
}
```

### 5. Limit File Sizes
```typescript
// Add to upload route
const maxSize = 10 * 1024 * 1024; // 10MB
if (size > maxSize) {
  throw new Error('File too large');
}
```

---

## Production Checklist

Before launch:

- [ ] Real storage provider configured
- [ ] Credentials in production environment variables
- [ ] Bucket/folder created
- [ ] File upload tested
- [ ] File deletion tested
- [ ] URLs are publicly accessible
- [ ] Costs monitored
- [ ] Backup strategy in place
- [ ] CDN configured (if using S3)

---

## Recommendations

### For MVP Launch (Recommended)
**Use Cloudinary:**
- Fastest setup (5 minutes)
- Most features out of the box
- CDN included
- Free tier is generous
- Image optimization automatic

### For Long-term Scale
**Migrate to AWS S3:**
- Much cheaper at scale
- Unlimited storage
- More control
- Industry standard
- Easy migration from Cloudinary

---

## Migration Between Providers

### Cloudinary → S3

1. Install S3 package
2. Update .env
3. Restart server
4. New uploads go to S3
5. Old files stay on Cloudinary
6. Optionally migrate old files

### S3 → Cloudinary

1. Install Cloudinary package
2. Update .env
3. Restart server
4. New uploads go to Cloudinary
5. Old files stay on S3
6. Optionally migrate old files

**Note:** Database stores storage key, so old files still accessible.

---

## Support

**Cloudinary:**
- Docs: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- Support: support@cloudinary.com

**AWS S3:**
- Docs: [docs.aws.amazon.com/s3](https://docs.aws.amazon.com/s3)
- Forum: [forums.aws.amazon.com](https://forums.aws.amazon.com)

**App Issues:**
- Check `backend/storage/index.ts`
- Enable logging: `DEBUG=* bun run start`
- Test with mock first, then switch to real provider

---

**Ready to set up? Start with Cloudinary - it's the fastest! ⚡**
