# Data Persistence Guide for NAZ TCG

## Overview
The NAZ TCG admin system now includes comprehensive data persistence to prevent data loss during deployments or browser issues.

## Features

### Automatic Backup System
- **Daily Backups**: Automatic backups every 24 hours
- **Cross-Tab Sync**: Data synchronized across browser tabs
- **Local Storage**: All data stored securely in browser localStorage

### Manual Backup & Restore
- **Export Data**: Download complete backup as JSON file
- **Import Data**: Restore from backup file
- **Data Overview**: View stats for products, orders, customers

### Data Protection
- **Deployment Safe**: Data persists through website updates
- **Browser Safe**: Automatic recovery from browser data loss
- **Version Control**: Backup files include timestamps and version info

## How to Use

### Creating Backups
1. Go to **Admin Portal** > **Data Management**
2. Click **"Create Backup"** to generate a new backup
3. Click **"Download Backup File"** to save to your computer
4. Store backup files safely (recommended: weekly downloads)

### Restoring Data
1. Go to **Admin Portal** > **Data Management**
2. Click **"Select Backup File"** and choose your backup JSON file
3. Click restore to import the data
4. **Warning**: This replaces all current data

### Backup Recommendations
- **Weekly Downloads**: Download backup files weekly for safety
- **Before Major Changes**: Always create backup before bulk operations
- **Multiple Locations**: Store backup files in multiple safe locations
- **Regular Monitoring**: Check backup status on dashboard

## Data Included in Backups
- ✅ All Products (including images, categories, stock levels)
- ✅ All Orders (customer info, payment details, shipping)
- ✅ All Customers (contact info, order history, totals)
- ✅ Timestamps and metadata

## Technical Details

### Storage Location
- **Primary**: Browser localStorage
- **Backup**: Downloaded JSON files
- **Sync**: Real-time across browser tabs

### Backup Format
```json
{
  "products": [...],
  "orders": [...],
  "customers": [...],
  "timestamp": "2025-11-16T...",
  "version": "1.0.0"
}
```

### Automatic Features
- Daily backup creation (background)
- Dashboard warnings for old backups
- Cross-tab synchronization
- Data integrity validation

## Troubleshooting

### Data Missing After Update
1. Check if backup exists in Data Management
2. Download latest backup file as precaution
3. System should auto-restore on next visit

### Browser Data Cleared
1. Go to Data Management page
2. Upload your most recent backup file
3. All data will be restored

### Backup File Issues
- Ensure file is valid JSON format
- Check file size (should contain data)
- Verify timestamp is recent

## Best Practices

1. **Regular Downloads**: Weekly backup downloads
2. **Before Changes**: Backup before major admin tasks
3. **Multiple Copies**: Keep backups in different locations
4. **Monitor Dashboard**: Check backup warnings
5. **Test Restores**: Occasionally test backup restore process

## Support

If you experience data loss or backup issues:
1. Check Data Management page first
2. Look for automatic backup recovery
3. Use most recent manual backup file
4. Contact support if data cannot be recovered

---

**Important**: While the system provides automatic backups, manual backup downloads are your best protection against data loss. Regular downloads ensure you always have access to your business data.