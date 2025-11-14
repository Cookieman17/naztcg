# NAZ TCG Grading Website

A professional Pokémon card authentication and grading service website built with React, TypeScript, and Tailwind CSS.

## Features

- 🃏 Card grading service tiers (Standard, Express, Super Express, Diamond Tier)
- 🛒 Shopping cart functionality with local storage
- 💎 Premium Diamond Tier with sparkle animations
- 📱 Responsive design with mobile slide-out navigation
- 🎨 Dark red theme with professional styling
- 📄 Product pages and cart management
- 📧 Contact forms and submission system

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom CSS animations
- **Build Tool**: Vite
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router
- **State Management**: React Context + localStorage
- **Icons**: Lucide React

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/cookieman17/naztcg.git
   cd naztcg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

3. **Configure Custom Domain (Optional)**
   - Add a `CNAME` file to the `public/` directory with your domain
   - Update the `homepage` field in `package.json`
   - Configure your domain's DNS to point to GitHub Pages

### Custom Domain Setup:

If you want to use your own domain name:

1. **Update package.json**
   ```json
   "homepage": "https://yourdomain.com"
   ```

2. **Create CNAME file**
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

3. **Update vite.config.ts**
   ```typescript
   base: mode === "production" ? "/" : "/",
   ```

4. **Configure DNS**
   - Add CNAME record: `www` → `cookieman17.github.io`
   - Add A records for apex domain to GitHub IPs

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── home/              # Home page sections
│   └── Navigation.tsx     # Main navigation
├── pages/                 # Route components
├── context/               # React contexts
├── lib/                   # Utilities and data
├── hooks/                 # Custom hooks
└── assets/                # Images and static files
```

## Key Features Implemented

- ✅ Hero banner with background image separation
- ✅ Mobile hamburger menu (left-side slide-out)
- ✅ Red theme with dark background
- ✅ Diamond Tier with sparkle animations
- ✅ Product catalog and cart system
- ✅ Responsive design
- ✅ Form submissions with toast notifications

## Environment Configuration

The site automatically detects the environment and configures paths accordingly:
- **Development**: Serves on localhost with hot reload
- **Production**: Builds with proper GitHub Pages asset paths

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is private and proprietary to NAZ TCG.
