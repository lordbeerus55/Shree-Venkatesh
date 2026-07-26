# Deployment Guide - Shree Venkatesh Admin Panel

This guide will help you deploy the Shree Venkatesh admin panel for free using Vercel (frontend) and Railway (backend + database).

## Prerequisites

- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app)

## Project Structure

```
Shree-Venkatesh/
├── frontend/ (React + Vite)
├── server/ (Node.js + Express + Prisma)
└── deployment configs
```

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect the server directory automatically

### 1.2 Configure Database

1. In Railway, click "New Service" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database
3. Copy the DATABASE_URL from the database service

### 1.3 Set Environment Variables

In your Railway backend service, add these environment variables:

```
DATABASE_URL = [your Railway PostgreSQL connection string]
JWT_SECRET = [generate a long random secret]
PORT = 5000
NODE_ENV = production
UPLOAD_DIR = uploads
FRONTEND_URL = https://your-vercel-app.vercel.app
```

To generate a JWT secret, run: `openssl rand -base64 32`

**Important**: Set `FRONTEND_URL` to your Vercel frontend URL (e.g., `https://your-app.vercel.app`). This is crucial for CORS to work in production.

### 1.4 Configure Build Settings

Railway should automatically detect the Node.js setup. Ensure:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 1.5 Run Database Migrations

1. Go to your Railway backend service
2. Click "Console" tab
3. Run: `npm run db:migrate`
4. Run: `npm run db:seed`

### 1.6 Get Backend URL

Once deployed, Railway will provide a URL like:
`https://your-backend-name.up.railway.app`

Copy this URL for the next step.

## Step 2: Deploy Frontend to Vercel

**Important**: Complete Step 1 (Backend) first, as you'll need the Railway backend URL for the frontend configuration.

### 2.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project" → "Continue with GitHub"
3. Select your repository
4. Vercel will detect the Vite configuration automatically

### 2.2 Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_API_URL = https://your-backend-name.up.railway.app/api
```

Replace with your actual Railway backend URL.

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your React app
3. You'll get a URL like: `https://your-project.vercel.app`

## Step 3: Final Configuration

### 3.1 Update Backend CORS Configuration

After deploying your frontend to Vercel, you need to update the Railway backend CORS settings:

1. Go to your Railway backend service
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your exact Vercel URL (e.g., `https://your-app.vercel.app`)
4. Redeploy the Railway backend to apply changes

### 3.2 Update Frontend Environment

After deployment, make sure your frontend is pointing to the correct backend URL:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Ensure `VITE_API_URL` is set to your Railway backend URL
4. Redeploy if needed

### 3.3 Test the Application

1. Open your Vercel frontend URL
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin@123`
3. Change the default password immediately

## Step 4: Database Management

### Access Prisma Studio

To manage your database visually:

1. Go to Railway → Select your PostgreSQL service
2. Click "Connect" → "Prisma Studio"
3. Or run locally: `npx prisma studio --schema server/prisma/schema.prisma`

### Backup Database

Railway automatically backs up your database. You can also:
- Export data from Prisma Studio
- Use Railway's backup features

## Troubleshooting

### Backend Issues

**Database connection errors:**
- Verify DATABASE_URL is correct in Railway
- Check that PostgreSQL service is running
- Ensure migrations ran successfully

**Build failures:**
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify TypeScript compilation works locally

**CORS errors in production:**
- Ensure FRONTEND_URL is set in Railway environment variables
- FRONTEND_URL should be your exact Vercel URL (e.g., `https://your-app.vercel.app`)
- Check Railway logs for CORS-related errors
- Verify NODE_ENV is set to `production`

### Frontend Issues

**API connection errors:**
- Verify VITE_API_URL is correct in Vercel
- Check that backend is deployed and accessible
- Ensure CORS is configured correctly in backend
- Verify Railway backend URL is accessible

**CORS errors in browser:**
- Check browser console for specific CORS error messages
- Verify FRONTEND_URL in Railway matches your Vercel domain exactly
- Ensure both frontend and backend are using HTTPS
- Clear browser cache and try again

**Build failures:**
- Check Vercel build logs
- Ensure build command works locally: `npm run build`
- Verify all dependencies are installed

## Cost Monitoring

Both Vercel and Railway have generous free tiers:

- **Vercel Free**: 100GB bandwidth, 6GB build minutes/month
- **Railway Free**: $5 free credit/month (good for small projects)

Monitor usage in respective dashboards to avoid unexpected charges.

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Use strong JWT_SECRET** - generate with `openssl rand -base64 32`
3. **Enable HTTPS** - both Vercel and Railway provide this automatically
4. **Set up CORS properly** - ensure only your frontend domain can access API
5. **Regular backups** - Railway handles this, but verify occasionally
6. **Monitor logs** - check for suspicious activity

## Scaling Considerations

If your application grows beyond free tier limits:

- **Vercel Pro**: $20/month for more bandwidth and build minutes
- **Railway**: Pay-as-you-go pricing for additional resources
- **Database**: Consider managed PostgreSQL services like Neon or Supabase

## Support

For issues:
- Vercel: vercel.com/docs
- Railway: docs.railway.app
- Project issues: Check server/README.md for API documentation