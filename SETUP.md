# Sri Ganga ERP - Setup & Installation Guide

## Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/Janarthanan051/sri-ganga-erp.git
cd sri-ganga-erp/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env.local
```

### 4. Configure Supabase Credentials
Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com → Project Settings → API

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Complete Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Supabase Account**: Free account at https://supabase.com
- **Vercel Account** (optional): For deployment

### Step-by-Step Setup

#### 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for database to initialize (2-3 minutes)

#### 2. Database Setup
Copy all SQL files from `backend/supabase/migrations/` sequentially:
1. Go to SQL Editor in Supabase
2. Click "New Query"
3. Paste the SQL from `001_initial_schema.sql` and run it
4. Repeat this process for all remaining files (`002` through `007`) in numerical order

#### 3. Storage Buckets
Create these public buckets in Supabase Storage:
- `payslips`
- `invoices`
- `receipts`
- `reports`
- `documents`

#### 4. Authentication
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional)

#### 5. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key

# Start development server
npm run dev
```

#### 6. Test the Application
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. You should now see the Dashboard

---

## Project Structure

```
sri-ganga-erp/
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── redux/              # Redux store
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── backend/
│   └── supabase/
│       ├── migrations/         # SQL migrations
│       ├── config.toml
│       └── seed/
├── README.md
└── SETUP.md (this file)
```

---

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run type-check   # Check TypeScript types
npm run lint        # Run ESLint
```

### Production
```bash
npm run build       # Create optimized build
npm run preview     # Preview production build locally
```

---

## Database Tables

### User Management
- `users` - Supabase Auth users
- `user_roles` - Role assignments

### HR Module
- `employees` - Employee data
- `attendance` - Attendance records
- `payroll` - Payroll data

### Inventory Module
- `products` - Product master
- `stock_inward` - Incoming stock
- `stock_outward` - Outgoing stock
- `wastage` - Wastage records

### Vendor/Order Module
- `vendors` - Vendor data
- `suppliers` - Supplier data
- `orders` - Purchase orders
- `order_items` - Order line items

### Operations
- `expenses` - Expense records
- `logistics` - Shipment tracking
- `activity_logs` - Audit trail

---

## Environment Variables

### Required
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional
```env
VITE_API_TIMEOUT=30000
VITE_APP_ENV=development
```

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection errors
**Solution**: 
1. Verify credentials in `.env.local`
2. Check Supabase project is online
3. Test connection in browser console:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Issue: Port 3000 already in use
**Solution**: 
```bash
npm run dev -- --port 3001
```

### Issue: Build fails
**Solution**: 
1. Check TypeScript errors: `npm run type-check`
2. Clear cache: `rm -rf dist && npm run build`
3. Check Node version: `node --version` (should be 18+)

---

## Development Workflow

1. Create a new branch
```bash
git checkout -b feature/new-feature
```

2. Make changes and test locally
```bash
npm run dev
```

3. Type check and lint
```bash
npm run type-check
npm run lint
```

4. Build for production
```bash
npm run build
```

5. Commit and push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

---

## Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click Import

2. **Configure environment variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Click Deploy

3. **Access your app**
   - Your app will be live at `your-project.vercel.app`

### Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy the `dist` folder** to your hosting service (Netlify, AWS, etc.)

---

## Production Checklist

- [ ] All tests pass
- [ ] TypeScript has no errors
- [ ] ESLint shows no warnings
- [ ] Environment variables are set
- [ ] Database migrations are applied
- [ ] Storage buckets are created
- [ ] RLS policies are enabled
- [ ] Authentication is configured
- [ ] CORS settings are correct
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Documentation is complete

---

## Support & Help

- GitHub Issues: https://github.com/Janarthanan051/sri-ganga-erp/issues
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

---

## License

Proprietary - Sri Ganga Food Products

---

**Questions?** Contact the development team or create an issue on GitHub.
