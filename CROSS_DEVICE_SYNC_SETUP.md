# Cross-Device Data Sync Setup Guide

## Problem Solved
This solution fixes the issue where products uploaded on one device (laptop) don't appear on other devices (mobile). Now all data syncs across devices automatically!

## Quick Setup (5 minutes)

### Step 1: Create Free Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project (choose any name)

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJ...`)

### Step 3: Configure Your App
1. In your project folder, copy `.env.example` to `.env`
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Database Tables
Run this SQL in your Supabase SQL Editor (go to SQL Editor in dashboard):

```sql
-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  series TEXT,
  rarity TEXT,
  stock INTEGER DEFAULT 0,
  image TEXT,
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  "customerName" TEXT,
  "customerEmail" TEXT,
  status TEXT,
  total DECIMAL(10,2),
  items JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  "totalOrders" INTEGER DEFAULT 0,
  "totalSpent" DECIMAL(10,2) DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount codes table
CREATE TABLE discount_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  type TEXT,
  value DECIMAL(10,2),
  "minOrder" DECIMAL(10,2),
  "maxUses" INTEGER,
  "usedCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "expiryDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (for safety)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow public access (since this is an admin-only system)
-- In production, you might want more restrictive policies
CREATE POLICY "Allow all access" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all access" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all access" ON discount_codes FOR ALL USING (true);
```

### Step 5: Test It!
1. Restart your development server: `npm run dev`
2. Upload a product on your laptop
3. Check on your mobile - it should appear automatically!

## How It Works

### Before (localStorage only)
- Laptop uploads product → saved only on laptop's browser
- Mobile accesses site → sees no products (different browser storage)
- Data trapped on individual devices

### After (Cloud + localStorage)
- Laptop uploads product → saved to cloud + laptop's browser
- Mobile accesses site → loads from cloud automatically
- All devices see the same data in real-time

### Hybrid Approach Benefits
- ✅ **Cross-device sync**: Products appear on all devices
- ✅ **Offline support**: Still works without internet (uses localStorage)
- ✅ **Real-time updates**: Changes sync within 30 seconds
- ✅ **Backup safety**: Data stored in multiple places
- ✅ **Free to use**: Supabase free tier is generous

## Troubleshooting

### "Local storage only" message appears
- Check your `.env` file has correct values
- Verify Supabase credentials in dashboard
- Restart development server after changing `.env`

### Products still not syncing
1. Clear browser cache/localStorage on all devices
2. Check browser console for error messages
3. Verify database tables were created correctly
4. Try uploading a new product after setup

### Need help?
- Check Supabase dashboard logs
- Ensure database tables exist
- Verify Row Level Security policies are set

## Migration

**Existing data is preserved!** When you first set up cloud storage, any existing products in localStorage will automatically migrate to the cloud. No data loss!

## Production Deployment

When deploying to production (Vercel, Netlify, etc.), make sure to set the environment variables in your hosting platform's settings, not just in the `.env` file.

---

That's it! Your NAZ TCG store now syncs across all devices. Upload products on any device and they'll appear everywhere instantly! 🚀