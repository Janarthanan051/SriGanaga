# Sri Ganga Food Products ERP

A comprehensive, production-ready Enterprise Resource Planning (ERP) system built with React, TypeScript, and Supabase for Sri Ganga Food Products.

## Features

### Core Modules

- **Dashboard** - Real-time insights with charts and key metrics
- **Inventory Management** - Product master, stock tracking, batch management
- **Stock Management** - Stock Inward/Outward with automatic calculations
- **Employee Management** - Full employee CRUD with auto-generated IDs
- **Attendance System** - Daily attendance tracking with monthly reports
- **Payroll Management** - Automatic salary calculations based on attendance
- **Vendor Management** - Vendor master with ledger and outstanding balance
- **Order Management** - Complete order lifecycle with status tracking
- **Logistics** - Vehicle and route tracking, dispatch management
- **Expense Management** - Expense tracking by category with receipt uploads
- **Wastage Tracking** - Track product wastage with automatic stock deduction
- **Reports & Analytics** - Multiple report generation (PDF, Excel)
- **Tally Integration** - Sync data with Tally ERP

### Security Features

- **JWT Authentication** via Supabase Auth
- **Row-Level Security (RLS)** for data protection
- **Role-Based Access Control (RBAC)**
  - Admin
  - HR Manager
  - Warehouse Manager
  - Accountant
  - Vendor Manager
- **Audit Logs** for compliance
- **Secure File Storage** with Supabase Storage

### Technology Stack

#### Frontend
- React 18 with TypeScript
- Vite for fast development and optimized builds
- Ant Design for enterprise UI components
- Redux Toolkit for state management
- React Router for navigation
- Recharts & ApexCharts for visualizations
- TailwindCSS for styling

#### Backend
- Supabase Cloud
- PostgreSQL database
- PostgREST for automatic API generation
- Edge Functions for serverless logic
- Realtime subscriptions
- Storage buckets for file management

#### Deployment
- Vercel for frontend hosting
- Supabase Cloud for backend
- GitHub for version control

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Janarthanan051/sri-ganga-erp.git
cd sri-ganga-erp/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Backend Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to initialize

2. **Run Database Migrations**
   - Copy the SQL migrations from `backend/supabase/migrations/`
   - Run them in Supabase SQL Editor:
     1. `001_initial_schema.sql` - Creates all tables and functions
     2. `002_rls_policies.sql` - Sets up security policies

3. **Configure Storage Buckets**
   - Create the following public buckets in Supabase Storage:
     - `payslips`
     - `invoices`
     - `receipts`
     - `reports`
     - `documents`

4. **Set Up Authentication**
   - Enable Email authentication in Supabase
   - Configure email templates (optional)

## Project Structure

```
sri-ganga-erp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── shared/
│   │   │       └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── SignUpPage.tsx
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── vendors/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   └── [other modules]
│   │   ├── redux/
│   │   │   ├── store.ts
│   │   │   ├── authSlice.ts
│   │   │   ├── inventorySlice.ts
│   │   │   └── hrSlice.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── hrService.ts
│   │   │   ├── inventoryService.ts
│   │   │   ├── vendorService.ts
│   │   │   └── operationsService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useData.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── helpers.ts
│   │   │   └── constants.ts
│   │   ├── config/
│   │   │   ├── supabase.ts
│   │   │   └── rbac.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── backend/
    └── supabase/
        ├── migrations/
        │   ├── 001_initial_schema.sql
        │   └── 002_rls_policies.sql
        ├── config.toml
        └── seed/
```

## Database Schema

The system includes 17 main tables:

1. **users** - User authentication (Supabase Auth)
2. **user_roles** - Role assignments
3. **employees** - Employee master data
4. **attendance** - Daily attendance records
5. **payroll** - Payroll records and calculations
6. **products** - Product master
7. **stock_inward** - Incoming stock records
8. **stock_outward** - Outgoing stock records
9. **vendors** - Vendor information
10. **suppliers** - Supplier information
11. **orders** - Purchase orders
12. **order_items** - Order line items
13. **logistics** - Shipment tracking
14. **wastage** - Product wastage tracking
15. **expenses** - Expense records
16. **activity_logs** - Audit trail
17. **notifications** - User notifications
18. **tally_sync_log** - Tally integration logs

## Key Features Implementation

### Employee ID Generation
Auto-generates employee IDs in format: `EMP-0001`, `EMP-0002`, etc.

### Stock Calculations
```
Current Stock = Total Inward - Total Outward - Total Wastage
```

### Payroll Formula
```
Net Salary = (Days Present / 26) × Monthly Salary
```

### Automatic Audit Trail
All changes are logged with user, timestamp, and before/after values.

## API Integration

All API calls go through Supabase PostgREST:

- **Authentication**: Supabase Auth with JWT tokens
- **Database Access**: Row-Level Security (RLS) enforced
- **File Storage**: Supabase Storage with role-based policies
- **Realtime**: Supabase Realtime subscriptions

## Building for Production

### Frontend Build
```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy to Vercel.

## Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## User Roles & Permissions

### Admin
- Full access to all modules
- User management
- System settings

### HR Manager
- Manage employees and documents
- Mark attendance
- Generate payroll
- View reports

### Warehouse Manager
- Manage inventory
- Record stock inward/outward
- Track logistics
- Record wastage

### Accountant
- View and manage expenses
- Generate financial reports
- View payroll
- Tally sync

### Vendor Manager
- Manage vendors and suppliers
- Create and manage orders
- View order status

## Development

### Code Structure
- **Components**: Reusable UI components
- **Pages**: Full page implementations
- **Services**: API communication layer
- **Redux**: Global state management
- **Hooks**: Custom React hooks
- **Types**: TypeScript interfaces and types
- **Utils**: Helper functions and constants

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## Production Checklist

- [ ] Update Supabase project credentials
- [ ] Configure CORS in Supabase
- [ ] Set up email notifications
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Test all user roles and permissions
- [ ] Performance optimization
- [ ] Security audit
- [ ] User training and documentation
- [ ] Data migration (if applicable)

## Troubleshooting

### Authentication Issues
- Ensure Supabase credentials are correct in `.env.local`
- Check user email is verified in Supabase
- Clear browser localStorage and try again

### Database Connection Issues
- Verify Supabase project is online
- Check network connectivity
- Verify RLS policies are enabled

### File Upload Issues
- Ensure storage buckets are created
- Check bucket policies are public (for viewing files)
- Verify file size limits

## Support

For issues and questions:
1. Check the GitHub Issues page
2. Review Supabase documentation
3. Contact the development team

## License

This project is proprietary and confidential to Sri Ganga Food Products.

## Version

Current Version: 1.0.0

---

**Built with ❤️ for Sri Ganga Food Products**
