# Deployment Guide - Sri Ganga ERP

## Deployment Options

### 1. Vercel (Recommended for Frontend)
- Free tier available
- Automatic deploys from GitHub
- Serverless functions support
- Global CDN
- Environment variables management

### 2. Netlify
- Similar to Vercel
- Easy GitHub integration
- Good for static sites with functions

### 3. Docker (Enterprise)
- Full control
- Consistent environments
- Suitable for on-premise deployment

### 4. AWS/Google Cloud
- Most flexible
- Can host both frontend and backend
- Higher cost

---

## Step-by-Step: Vercel Deployment

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository
- Supabase project
- Environment variables ready

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### 3. Configure Project
1. **Framework**: Select "Vite" or "Other"
2. **Root Directory**: Leave as default (frontend)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 4. Add Environment Variables
1. Go to "Environment Variables"
2. Add the following:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Click "Add"

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Get your deployment URL

### 6. Verify Deployment
1. Visit your Vercel URL
2. Test login functionality
3. Check all pages load correctly

---

## Environment-Specific Configuration

### Development
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
VITE_APP_ENV=development
```

### Staging
```env
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_APP_ENV=staging
```

### Production
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_APP_ENV=production
```

---

## Supabase Production Setup

### 1. Enable Replication
- Go to Database → Replication
- Enable replication for critical tables
- Configure standby databases

### 2. Configure Backups
1. Go to Settings → Backups
2. Enable automated daily backups
3. Set retention to 30 days

### 3. Set Up Monitoring
1. Go to Settings → Monitoring
2. Enable database monitoring
3. Set up alerts for:
   - High CPU usage
   - Connection pool exhaustion
   - Failed API calls

### 4. Configure Email Templates
1. Go to Auth → Email Templates
2. Customize confirmation emails
3. Set up password reset emails
4. Add organization branding

### 5. Set CORS Policy
1. Go to Settings → API
2. Add your Vercel URL:
   ```
   https://your-project.vercel.app
   https://your-domain.com
   ```

---

## Continuous Deployment

### GitHub Actions Setup (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, staging]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      
      - run: npm run type-check
      
      - run: npm run build
      
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Performance Optimization

### 1. Build Optimization
- Enable minification
- Code splitting
- Tree shaking
- Lazy loading of pages

### 2. Caching Strategy
- Browser caching: 1 year for assets
- API caching: 5-10 minutes for data
- Database query caching

### 3. CDN Configuration
- Vercel automatically uses CDN
- Assets cached globally
- Instant worldwide distribution

### 4. Database Optimization
- Add indexes on frequently queried columns
- Use prepared statements
- Optimize RLS policies

---

## Monitoring & Analytics

### 1. Set Up Error Tracking
- Sentry (https://sentry.io)
- Error boundary in React
- Automatic error reporting

### 2. Analytics
- Google Analytics
- Vercel Analytics
- Custom event tracking

### 3. Uptime Monitoring
- Pingdom or similar
- Alert on downtime
- Monthly uptime reports

---

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] RLS policies enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates
- [ ] Dependency scanning
- [ ] SSL certificate valid
- [ ] Password requirements set
- [ ] 2FA available (optional)
- [ ] Audit logging enabled

---

## Rollback Procedure

### If something goes wrong:

1. **Revert to previous version**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Vercel will automatically redeploy** with previous code

3. **Or manually rollback in Vercel**
   - Go to Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

---

## Cost Estimation (Monthly)

### Vercel
- Frontend hosting: Free (~$20/month for production features)
- Functions: Included in plan

### Supabase
- Database: Free tier up to 500 MB ($25/month for more)
- Storage: Free tier up to 1 GB
- Realtime: Included
- Auth: Free

**Total estimated monthly cost**: $0-50

---

## Post-Deployment

### 1. Test All Features
- [ ] Login/Signup
- [ ] All page navigation
- [ ] Data operations (Create, Read, Update, Delete)
- [ ] File uploads
- [ ] Reports generation
- [ ] Mobile responsiveness

### 2. User Communication
- Send deployment notice
- Provide login credentials
- Share user documentation
- Set up support channel

### 3. Monitor & Maintain
- Check error logs daily
- Monitor performance metrics
- Respond to user feedback
- Plan updates and improvements

---

## Troubleshooting Deployment

### Build fails
1. Check build logs in Vercel
2. Run `npm run build` locally
3. Fix any TypeScript errors
4. Verify all dependencies installed

### Page blank after deploy
1. Check console for errors
2. Verify environment variables are set
3. Check Supabase project is online
4. Clear browser cache

### Slow performance
1. Check database query performance
2. Enable caching
3. Optimize images
4. Check Vercel analytics

---

## Support

- Vercel Support: vercel.com/help
- Supabase Support: supabase.com/support
- GitHub Issues: Your repo issues
- Community: React, Vite, Supabase communities

---

**Ready to deploy?** Start with Vercel! It takes just 5 minutes.
