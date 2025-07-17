# Deployment Guide for Render

## Unified Deployment (Recommended)

The updated configuration provides a single service that handles both static site serving and admin functionality:

### Quick Deploy with Render

1. **Connect Repository**: Link your GitHub repository to Render
2. **Use render.yaml**: The included `render.yaml` automatically configures:
   - Node.js environment with both static serving and admin interface
   - Database persistence via mounted disk storage
   - Security headers and environment variables
3. **Deploy**: Your site will be available with both public pages and admin interface

### What You Get

- **Public Site**: Home, About, Blog pages served statically
- **Admin Interface**: Accessible at `/admin` with login functionality
- **Content Management**: Create and edit pages/posts through the admin
- **Build Integration**: Auto-rebuilds static files when content changes

### Default Credentials

- **Username**: `bogdan`
- **Password**: `bogdan`

⚠️ **Important**: Change these credentials immediately after deployment!

## Alternative: Static-Only Deployment

For a pure static site without admin functionality:

1. **Build locally**: `npm run build`
2. **Deploy build/ directory** to any static hosting service
3. **Note**: No content management capabilities

## Manual Deployment Steps

### For Full Site (with Admin):

```bash
# Install dependencies
npm install

# Initialize database
npm run setup

# Build static files
npm run build

# Start server (serves both static and admin)
npm start

# Access admin at http://localhost:3000/admin
```

### For Static-Only:

```bash
# Build the static site
npm run build

# Deploy the build/ directory to any static hosting service
```

## Production Considerations

1. **Security**: Change default admin credentials immediately
2. **Environment Variables**: 
   - `NODE_ENV=production`
   - `SESSION_SECRET`: Use a strong, randomly generated value
3. **Database Backups**: SQLite database is stored in persistent disk storage
4. **HTTPS**: Render provides HTTPS automatically

## Features

- ✅ **Home and About pages** working correctly
- ✅ **Admin panel** accessible with login functionality  
- ✅ **Blog post creation** and management
- ✅ **Page editing** capabilities
- ✅ **Static site generation** for fast loading
- ✅ **Responsive design** for mobile and desktop

## Troubleshooting

### Common Issues Fixed:
- ❌ 404 errors for Home/About pages → ✅ Fixed routing configuration
- ❌ Missing admin access → ✅ Admin link added to navigation
- ❌ Database path issues → ✅ Production-ready database configuration

### Navigation:
- **Home**: `/` (also `/index.html`)
- **About**: `/about` (also `/about.html`) 
- **Blog**: `/blog` (lists all posts)
- **Admin**: `/admin` (login required)

## Customization

- **Styling**: Modify CSS generation in `scripts/build.js`
- **Templates**: Edit EJS templates in `views/` directory  
- **Content Structure**: Extend database schema in `server/database.js`
- **Admin Interface**: Customize admin templates in `views/` directory