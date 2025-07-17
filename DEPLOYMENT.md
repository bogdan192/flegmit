# Deployment Guide for Render

## Option 1: Static Site Only (Recommended for Production)

For a pure static site deployment:

1. **Connect Repository**: Link your GitHub repository to Render
2. **Create Static Site**: 
   - Build Command: `npm run build`
   - Publish Directory: `build`
3. **Deploy**: Your static site will be available at the Render URL

## Option 2: Full CMS + Static Site

For development or if you need ongoing content management:

1. **Deploy both services** from the `render.yaml` configuration
2. **Static Site Service**: Serves the built static files
3. **CMS Admin Service**: Provides the admin interface for content management

### Environment Variables for CMS Service

- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: Generate a secure random value

### Database Persistence

The CMS service includes persistent disk storage for the SQLite database to ensure content persists across deployments.

## Manual Deployment Steps

### For Static Site Only:

```bash
# Build the static site
npm run build

# Deploy the build/ directory to any static hosting service
```

### For Development:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Access admin at http://localhost:3000/admin
# Default login: bogdan/bogdan
```

## Production Considerations

1. **Change Default Credentials**: Update the default admin password in production
2. **Secure Session Secret**: Use a strong, randomly generated session secret
3. **Database Backups**: Regularly backup the SQLite database if using the CMS service
4. **HTTPS**: Ensure your deployment uses HTTPS for security

## Customization

- **Styling**: Modify the CSS generation in `scripts/build.js`
- **Templates**: Edit EJS templates in `views/` directory
- **Content Structure**: Extend database schema in `server/database.js`