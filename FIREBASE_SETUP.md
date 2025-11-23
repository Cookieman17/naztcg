# 🔥 Firebase Setup Guide for NAZ TCG Store

## Quick Start (5 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `naztcg-store`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Set up Firestore Database
1. In Firebase console → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select region (e.g., `us-central1`)

### 3. Get Your Config
1. Project Settings (gear icon) → "Your apps"
2. Click web icon `</>`
3. App name: `NAZ TCG Store`
4. Copy the config object

### 4. Add to Environment Variables
Replace the placeholder values in your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### 5. Test It Works
1. Save your `.env` file
2. Restart your dev server: `npm run dev`
3. Check browser console for: `🔥 Firebase initialized successfully`
4. Add a product in Admin → should appear instantly in Shop

## What You Get

✅ **Real-time Updates**: Products appear instantly across all devices  
✅ **Cloud Storage**: 1GB free, 50k reads/day, 20k writes/day  
✅ **No Credit Card**: Truly free tier  
✅ **Automatic Backup**: Google's infrastructure  
✅ **Cross-Device Sync**: Cart and products sync everywhere  

## Current Status

Your app works with **localStorage backup** right now. Adding Firebase gives you:
- Real-time synchronization
- Cloud persistence 
- Multi-device access
- Professional reliability

The setup takes 5 minutes and works immediately! 🚀

## Security Rules (Later)

Once you're ready to go live, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: read for everyone, write for authenticated users only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Carts: only for the user who owns them
    match /carts/{cartId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```