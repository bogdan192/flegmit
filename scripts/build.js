const fs = require('fs-extra');
const path = require('path');
const Database = require('../server/database');

class StaticSiteBuilder {
  constructor() {
    this.db = new Database();
    this.buildDir = path.join(__dirname, '../build');
    this.templatesDir = path.join(__dirname, '../src/templates');
  }

  async build() {
    console.log('🚀 Starting static site build...');
    
    try {
      // Ensure build directory exists and is clean
      await fs.ensureDir(this.buildDir);
      await fs.emptyDir(this.buildDir);
      
      // Get site settings
      const settings = await this.getSettings();
      
      // Get published content
      const pages = await this.getPublishedPages();
      const posts = await this.getPublishedPosts();
      
      // Generate CSS
      await this.generateCSS(settings);
      
      // Generate pages
      await this.generatePages(pages, posts, settings);
      
      // Generate blog pages
      await this.generateBlogPages(posts, settings);
      
      // Generate blog index
      await this.generateBlogIndex(posts, settings);
      
      // Generate RSS feed
      await this.generateRSSFeed(posts, settings);
      
      // Generate 404 page
      await this.generate404Page(settings);
      
      // Copy static assets
      await this.copyStaticAssets();
      
      console.log('✅ Static site build completed successfully!');
      console.log(`📁 Built files are in: ${this.buildDir}`);
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      throw error;
    }
  }

  async getSettings() {
    return new Promise((resolve, reject) => {
      this.db.getAllSettings((err, settingsArray) => {
        if (err) return reject(err);
        
        const settings = {};
        settingsArray.forEach(setting => {
          settings[setting.key] = setting.value;
        });
        
        // Set defaults
        settings.site_title = settings.site_title || 'Flegmit Site';
        settings.site_description = settings.site_description || 'A static site with CMS capabilities';
        settings.site_url = settings.site_url || 'https://your-site.com';
        settings.theme_color = settings.theme_color || '#3498db';
        settings.site_language = settings.site_language || 'en';
        
        resolve(settings);
      });
    });
  }

  async getPublishedPages() {
    return new Promise((resolve, reject) => {
      this.db.getAllPages((err, pages) => {
        if (err) return reject(err);
        resolve(pages.filter(page => page.published));
      });
    });
  }

  async getPublishedPosts() {
    return new Promise((resolve, reject) => {
      this.db.getAllPosts((err, posts) => {
        if (err) return reject(err);
        resolve(posts.filter(post => post.published));
      });
    });
  }

  generatePageHTML(title, content, settings, isHomePage = false) {
    const description = settings.site_description;
    const keywords = settings.site_keywords || '';
    const author = settings.site_author || '';
    const headerCode = settings.header_code || '';
    const footerCode = settings.footer_code || '';
    
    return `<!DOCTYPE html>
<html lang="${settings.site_language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${settings.site_title}</title>
    <meta name="description" content="${description}">
    ${keywords ? `<meta name="keywords" content="${keywords}">` : ''}
    ${author ? `<meta name="author" content="${author}">` : ''}
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${settings.site_url}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <link rel="stylesheet" href="/styles.css">
    <link rel="canonical" href="${settings.site_url}">
    ${headerCode}
</head>
<body>
    <header class="site-header">
        <div class="container">
            <nav class="main-nav">
                <a href="/" class="logo">${settings.site_title}</a>
                <ul class="nav-menu">
                    <li><a href="/" ${isHomePage ? 'class="active"' : ''}>Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/admin" class="admin-link">Admin</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            ${content}
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${settings.site_title}. All rights reserved.</p>
        </div>
    </footer>
    
    ${footerCode}
</body>
</html>`;
  }

  async generateCSS(settings) {
    const css = `
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* Header Styles */
.site-header {
    background-color: ${settings.theme_color};
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

.nav-menu a:hover,
.nav-menu a.active {
    opacity: 0.8;
}

.nav-menu .admin-link {
    background-color: rgba(255,255,255,0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-menu .admin-link:hover {
    background-color: rgba(255,255,255,0.3);
    opacity: 1;
}

/* Main Content */
.main-content {
    min-height: calc(100vh - 200px);
    padding: 2rem 0;
}

.page-content {
    max-width: 800px;
    margin: 0 auto;
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.page-meta {
    color: #666;
    margin-bottom: 2rem;
    font-size: 0.9rem;
}

.post-excerpt {
    color: #666;
    font-style: italic;
    margin-bottom: 1rem;
}

.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4,
.post-content h5,
.post-content h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.post-content p {
    margin-bottom: 1rem;
}

.post-content img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 8px;
}

.post-content blockquote {
    border-left: 4px solid ${settings.theme_color};
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #666;
}

.post-content code {
    background-color: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.post-content pre {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
}

/* Blog Styles */
.post-list {
    display: grid;
    gap: 2rem;
    margin-top: 2rem;
}

.post-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 2rem;
    transition: transform 0.3s;
}

.post-card:hover {
    transform: translateY(-2px);
}

.post-card h2 {
    margin-bottom: 0.5rem;
}

.post-card h2 a {
    color: #2c3e50;
    text-decoration: none;
}

.post-card h2 a:hover {
    color: ${settings.theme_color};
}

.post-date {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

/* Footer */
.site-footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .main-nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-menu {
        gap: 1rem;
    }
    
    .page-title {
        font-size: 2rem;
    }
}

/* Utility Classes */
.text-center {
    text-align: center;
}

.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.mb-1 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 2rem; }
`;

    await fs.writeFile(path.join(this.buildDir, 'styles.css'), css);
  }

  async generatePages(pages, posts, settings) {
    for (const page of pages) {
      let content = `<div class="page-content">
        <h1 class="page-title">${page.title}</h1>
        <div class="post-content">
          ${page.content}
        </div>
      </div>`;
      
      const html = this.generatePageHTML(page.title, content, settings, page.slug === 'home');
      
      if (page.slug === 'home') {
        await fs.writeFile(path.join(this.buildDir, 'index.html'), html);
      } else {
        await fs.writeFile(path.join(this.buildDir, `${page.slug}.html`), html);
      }
    }
  }

  async generateBlogPages(posts, settings) {
    for (const post of posts) {
      const content = `<div class="page-content">
        <h1 class="page-title">${post.title}</h1>
        <div class="page-meta">
          <time datetime="${post.created_at}">${new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</time>
        </div>
        ${post.excerpt ? `<div class="post-excerpt">${post.excerpt}</div>` : ''}
        <div class="post-content">
          ${post.content}
        </div>
      </div>`;
      
      const html = this.generatePageHTML(post.title, content, settings);
      
      // Ensure blog directory exists
      await fs.ensureDir(path.join(this.buildDir, 'blog'));
      await fs.writeFile(path.join(this.buildDir, 'blog', `${post.slug}.html`), html);
    }
  }

  async generateBlogIndex(posts, settings) {
    const postsHTML = posts.map(post => `
      <article class="post-card">
        <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
        <div class="post-date">${new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
        ${post.excerpt ? `<p>${post.excerpt}</p>` : ''}
      </article>
    `).join('');

    const content = `<div class="page-content">
      <h1 class="page-title">Blog</h1>
      <div class="post-list">
        ${postsHTML || '<p>No blog posts yet.</p>'}
      </div>
    </div>`;

    const html = this.generatePageHTML('Blog', content, settings);
    await fs.writeFile(path.join(this.buildDir, 'blog.html'), html);
  }

  async generateRSSFeed(posts, settings) {
    const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${settings.site_url}/blog/${post.slug}</link>
      <guid>${settings.site_url}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || post.content.substring(0, 200) + '...'}]]></description>
    </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${settings.site_title}</title>
    <link>${settings.site_url}</link>
    <description>${settings.site_description}</description>
    <language>${settings.site_language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    await fs.writeFile(path.join(this.buildDir, 'feed.xml'), rss);
  }

  async generate404Page(settings) {
    const content = `<div class="page-content text-center">
      <h1 class="page-title">404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p><a href="/">Go back to home</a></p>
    </div>`;

    const html = this.generatePageHTML('404 - Page Not Found', content, settings);
    await fs.writeFile(path.join(this.buildDir, '404.html'), html);
  }

  async copyStaticAssets() {
    // Copy any static assets from src/static if they exist
    const staticDir = path.join(__dirname, '../src/static');
    if (await fs.pathExists(staticDir)) {
      await fs.copy(staticDir, this.buildDir);
    }
  }
}

// Build the site
const builder = new StaticSiteBuilder();
builder.build().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

module.exports = StaticSiteBuilder;