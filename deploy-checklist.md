# Deployment Checklist

Use this checklist to ensure you've completed all deployment steps.

## Pre-Deployment

- [x] Create GitHub repository and push code
- [x] Create Vercel account
- [x] Create Railway account
- [x] Generate JWT secret: `openssl rand -base64 32`

## Backend Deployment (Railway)

- [x] Create Railway project from GitHub repo
- [x] Add PostgreSQL database service
- [x] Copy DATABASE_URL from PostgreSQL service
- [x] Set environment variables in Railway backend:
  - [x] DATABASE_URL
  - [x] JWT_SECRET
  - [x] PORT=5000
  - [x] NODE_ENV=production
  - [x] UPLOAD_DIR=uploads
  - [x] FRONTEND_URL (your Vercel frontend URL)
- [x] Deploy backend service
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Seed database: `npm run db:seed`
- [x] Copy backend URL (e.g., https://xxx.up.railway.app)

## Frontend Deployment (Vercel)

- [x] Create Vercel project from GitHub repo
- [x] Set environment variable: VITE_API_URL (use Railway backend URL)
- [x] Deploy frontend
- [x] Copy frontend URL (e.g., https://xxx.vercel.app)

## Post-Deployment CORS Configuration

- [x] Update Railway FRONTEND_URL environment variable with Vercel URL
- [] Redeploy Railway backend to apply CORS changes
- [] Verify both services are running

## Post-Deployment

- [x] Test frontend loads correctly
- [ ] Test login with default credentials (admin/admin@123)
- [ ] Change default admin password
- [ ] Test API connectivity
- [ ] Verify database operations work
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors
- [ ] Test file uploads (if applicable)
- [ ] Verify all pages load correctly

## Security

- [ ] Default password changed
- [ ] Strong JWT secret used
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] CORS configured properly
- [ ] Environment variables secured

## Monitoring

- [ ] Set up Railway usage monitoring
- [ ] Set up Vercel usage monitoring
- [ ] Check free tier limits
- [ ] Set up alerts if available