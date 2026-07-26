# Deployment Checklist

Use this checklist to ensure you've completed all deployment steps.

## Pre-Deployment

- [ ] Create GitHub repository and push code
- [ ] Create Vercel account
- [ ] Create Railway account
- [ ] Generate JWT secret: `openssl rand -base64 32`

## Backend Deployment (Railway)

- [ ] Create Railway project from GitHub repo
- [ ] Add PostgreSQL database service
- [ ] Copy DATABASE_URL from PostgreSQL service
- [ ] Set environment variables in Railway backend:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] PORT=5000
  - [ ] NODE_ENV=production
  - [ ] UPLOAD_DIR=uploads
  - [ ] FRONTEND_URL (your Vercel frontend URL)
- [ ] Deploy backend service
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Seed database: `npm run db:seed`
- [ ] Copy backend URL (e.g., https://xxx.up.railway.app)

## Frontend Deployment (Vercel)

- [ ] Create Vercel project from GitHub repo
- [ ] Set environment variable: VITE_API_URL (use Railway backend URL)
- [ ] Deploy frontend
- [ ] Copy frontend URL (e.g., https://xxx.vercel.app)

## Post-Deployment CORS Configuration

- [ ] Update Railway FRONTEND_URL environment variable with Vercel URL
- [ ] Redeploy Railway backend to apply CORS changes
- [ ] Verify both services are running

## Post-Deployment

- [ ] Test frontend loads correctly
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