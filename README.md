# Flegmit - Static Site Generator with CMS

Flegmit is a powerful static site generator with a WordPress-like content management system. Create, edit, and manage your content through a user-friendly admin interface, then build static files for fast, secure deployment.

## Features

- **CMS Interface**: WordPress-like admin panel for content management
- **Static Site Generation**: Builds fast, secure static HTML files
- **Authentication**: Secure login system with customizable credentials
- **Database-Driven**: SQLite database for storing content and settings
- **Responsive Design**: Mobile-friendly admin interface and generated sites
- **SEO-Friendly**: Built-in SEO optimization and meta tag management
- **Blog Support**: Full blog functionality with posts and RSS feeds
- **Deployment Ready**: Generates optimized files for services like Render

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000/admin`


### 3. Build Static Site

```bash
npm run build
```

Static files will be generated in the `build/` directory, ready for deployment.

## Usage

### Admin Interface

1. **Dashboard**: Overview of your content and quick actions
2. **Pages**: Create and manage static pages (Home, About, etc.)
3. **Posts**: Create and manage blog posts
4. **Settings**: Configure site metadata, SEO, and appearance

### Content Management

- Create pages with custom URLs and content
- Write blog posts with excerpts and publishing controls
- Manage SEO metadata and descriptions
- Customize site settings and appearance

### Building and Deployment

The build process generates:
- Static HTML files for all published pages and posts
- CSS stylesheets with customizable theming
- RSS feed for blog posts
- 404 error page
- Optimized meta tags and SEO

## Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

### Other Platforms

The `build/` directory contains standard static files that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting service

## File Structure

```
flegmit/
├── server/          # Express server and database
├── views/           # EJS templates for admin interface
├── scripts/         # Build scripts
├── src/             # Source templates and content
├── build/           # Generated static files (auto-generated)
├── database/        # SQLite database files (auto-generated)
└── package.json     # Dependencies and scripts
```

## Configuration

### Database

The system automatically creates a SQLite database with:
- Default user (bogdan/bogdan)
- Sample pages (Home, About)
- Site settings

### Settings

Configure your site through the admin interface:
- Site title and description
- SEO metadata
- Theme colors
- Custom CSS/JS code

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build static site
- `npm start` - Start production server

### Customization

1. **Styling**: Modify the build script to customize CSS generation
2. **Templates**: Edit EJS templates in the `views/` directory
3. **Content Structure**: Extend the database schema in `server/database.js`

## Security

- Passwords are hashed using bcrypt
- Session-based authentication
- SQL injection protection with parameterized queries
- CSRF protection through session management

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

For issues and feature requests, please use the GitHub issue tracker.
