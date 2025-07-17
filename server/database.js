const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    // Ensure database directory exists
    // In production on Render, use the mounted disk path
    const dbDir = process.env.NODE_ENV === 'production' 
      ? '/opt/render/project/src/database'
      : path.join(__dirname, '../database');
      
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'site.db');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    // Create tables
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Pages table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT,
          meta_description TEXT,
          published BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Posts table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT,
          excerpt TEXT,
          published BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Site settings table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create default user and settings
      this.createDefaults();
    });
  }

  async createDefaults() {
    // Create default user
    const hashedPassword = await bcrypt.hash('bogdan', 10);
    this.db.run(
      'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)',
      ['bogdan', hashedPassword]
    );

    // Create default settings
    const defaultSettings = [
      ['site_title', 'Flegmit Site'],
      ['site_description', 'A static site with CMS capabilities'],
      ['site_url', 'https://your-site.com']
    ];

    defaultSettings.forEach(([key, value]) => {
      this.db.run(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    });

    // Create default pages
    this.db.run(`
      INSERT OR IGNORE INTO pages (title, slug, content, published) VALUES 
      ('Home', 'home', '<h1>Welcome to Flegmit</h1><p>This is your home page. You can edit this content in the admin panel.</p>', 1),
      ('About', 'about', '<h1>About</h1><p>Tell your story here.</p>', 1)
    `);
  }

  // User methods
  getUserByUsername(username, callback) {
    this.db.get('SELECT * FROM users WHERE username = ?', [username], callback);
  }

  // Page methods
  getAllPages(callback) {
    this.db.all('SELECT * FROM pages ORDER BY created_at DESC', callback);
  }

  getPageBySlug(slug, callback) {
    this.db.get('SELECT * FROM pages WHERE slug = ?', [slug], callback);
  }

  getPageById(id, callback) {
    this.db.get('SELECT * FROM pages WHERE id = ?', [id], callback);
  }

  createPage(data, callback) {
    const { title, slug, content, meta_description, published } = data;
    this.db.run(
      'INSERT INTO pages (title, slug, content, meta_description, published) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, meta_description, published ? 1 : 0],
      callback
    );
  }

  updatePage(id, data, callback) {
    const { title, slug, content, meta_description, published } = data;
    this.db.run(
      'UPDATE pages SET title = ?, slug = ?, content = ?, meta_description = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, content, meta_description, published ? 1 : 0, id],
      callback
    );
  }

  deletePage(id, callback) {
    this.db.run('DELETE FROM pages WHERE id = ?', [id], callback);
  }

  // Post methods
  getAllPosts(callback) {
    this.db.all('SELECT * FROM posts ORDER BY created_at DESC', callback);
  }

  getPostBySlug(slug, callback) {
    this.db.get('SELECT * FROM posts WHERE slug = ?', [slug], callback);
  }

  getPostById(id, callback) {
    this.db.get('SELECT * FROM posts WHERE id = ?', [id], callback);
  }

  createPost(data, callback) {
    const { title, slug, content, excerpt, published } = data;
    this.db.run(
      'INSERT INTO posts (title, slug, content, excerpt, published) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, excerpt, published ? 1 : 0],
      callback
    );
  }

  updatePost(id, data, callback) {
    const { title, slug, content, excerpt, published } = data;
    this.db.run(
      'UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, content, excerpt, published ? 1 : 0, id],
      callback
    );
  }

  deletePost(id, callback) {
    this.db.run('DELETE FROM posts WHERE id = ?', [id], callback);
  }

  // Settings methods
  getAllSettings(callback) {
    this.db.all('SELECT * FROM settings', callback);
  }

  getSetting(key, callback) {
    this.db.get('SELECT value FROM settings WHERE key = ?', [key], callback);
  }

  updateSetting(key, value, callback) {
    this.db.run(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value],
      callback
    );
  }
}

module.exports = Database;