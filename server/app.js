const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/admin/assets', express.static(path.join(__dirname, '../admin')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'flegmit-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/admin/login');
  }
}

// Create admin router for better organization and separation
const adminRouter = express.Router();

// Admin login routes
adminRouter.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }
  res.render('login', { error: null });
});

adminRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.getUserByUsername(username, async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    try {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid) {
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/admin');
      } else {
        res.render('login', { error: 'Invalid username or password' });
      }
    } catch (error) {
      res.render('login', { error: 'Login error occurred' });
    }
  });
});

adminRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/admin/login');
  });
});

// Admin dashboard routes
adminRouter.get('/', requireAuth, (req, res) => {
  db.getAllPages((err, pages) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    db.getAllPosts((err, posts) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.render('dashboard', { user: req.session.user, pages, posts });
    });
  });
});

// Pages management
adminRouter.get('/pages', requireAuth, (req, res) => {
  db.getAllPages((err, pages) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('pages', { user: req.session.user, pages });
  });
});

adminRouter.get('/pages/new', requireAuth, (req, res) => {
  res.render('edit-page', { user: req.session.user, page: null, action: 'create' });
});

adminRouter.get('/pages/:id/edit', requireAuth, (req, res) => {
  db.getPageById(req.params.id, (err, page) => {
    if (err || !page) {
      return res.status(404).send('Page not found');
    }
    res.render('edit-page', { user: req.session.user, page, action: 'edit' });
  });
});

adminRouter.post('/pages', requireAuth, (req, res) => {
  const pageData = {
    title: req.body.title,
    slug: req.body.slug,
    content: req.body.content,
    meta_description: req.body.meta_description,
    published: req.body.published === 'on'
  };
  
  db.createPage(pageData, (err) => {
    if (err) {
      return res.status(500).send('Error creating page');
    }
    res.redirect('/admin/pages');
  });
});

adminRouter.post('/pages/:id', requireAuth, (req, res) => {
  const pageData = {
    title: req.body.title,
    slug: req.body.slug,
    content: req.body.content,
    meta_description: req.body.meta_description,
    published: req.body.published === 'on'
  };
  
  db.updatePage(req.params.id, pageData, (err) => {
    if (err) {
      return res.status(500).send('Error updating page');
    }
    res.redirect('/admin/pages');
  });
});

adminRouter.post('/pages/:id/delete', requireAuth, (req, res) => {
  db.deletePage(req.params.id, (err) => {
    if (err) {
      return res.status(500).send('Error deleting page');
    }
    res.redirect('/admin/pages');
  });
});

// Posts management
adminRouter.get('/posts', requireAuth, (req, res) => {
  db.getAllPosts((err, posts) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('posts', { user: req.session.user, posts });
  });
});

adminRouter.get('/posts/new', requireAuth, (req, res) => {
  res.render('edit-post', { user: req.session.user, post: null, action: 'create' });
});

adminRouter.get('/posts/:id/edit', requireAuth, (req, res) => {
  db.getPostById(req.params.id, (err, post) => {
    if (err || !post) {
      return res.status(404).send('Post not found');
    }
    res.render('edit-post', { user: req.session.user, post, action: 'edit' });
  });
});

adminRouter.post('/posts', requireAuth, (req, res) => {
  const postData = {
    title: req.body.title,
    slug: req.body.slug,
    content: req.body.content,
    excerpt: req.body.excerpt,
    published: req.body.published === 'on'
  };
  
  db.createPost(postData, (err) => {
    if (err) {
      return res.status(500).send('Error creating post');
    }
    res.redirect('/admin/posts');
  });
});

adminRouter.post('/posts/:id', requireAuth, (req, res) => {
  const postData = {
    title: req.body.title,
    slug: req.body.slug,
    content: req.body.content,
    excerpt: req.body.excerpt,
    published: req.body.published === 'on'
  };
  
  db.updatePost(req.params.id, postData, (err) => {
    if (err) {
      return res.status(500).send('Error updating post');
    }
    res.redirect('/admin/posts');
  });
});

adminRouter.post('/posts/:id/delete', requireAuth, (req, res) => {
  db.deletePost(req.params.id, (err) => {
    if (err) {
      return res.status(500).send('Error deleting post');
    }
    res.redirect('/admin/posts');
  });
});

// Build trigger
adminRouter.post('/build', requireAuth, (req, res) => {
  const { exec } = require('child_process');
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Build failed', details: stderr });
    }
    res.json({ success: true, output: stdout });
  });
});

// Settings
adminRouter.get('/settings', requireAuth, (req, res) => {
  db.getAllSettings((err, settings) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    res.render('settings', { user: req.session.user, settings: settingsObj });
  });
});

adminRouter.post('/settings', requireAuth, (req, res) => {
  const settings = req.body;
  let completed = 0;
  const total = Object.keys(settings).length;
  
  Object.entries(settings).forEach(([key, value]) => {
    db.updateSetting(key, value, (err) => {
      completed++;
      if (completed === total) {
        res.redirect('/admin/settings');
      }
    });
  });
});

// Mount admin router
app.use('/admin', adminRouter);

// Public routes (serve static site)
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../build/index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Site not built yet. Please run the build process.');
    }
  });
});

// Serve static assets from build directory, but exclude admin paths
app.use((req, res, next) => {
  // Skip static file serving for any admin routes or admin-related paths
  if (req.path.startsWith('/admin')) {
    return next();
  }
  express.static(path.join(__dirname, '../build'))(req, res, next);
});

app.get('/:slug', (req, res, next) => {
  const filePath = path.join(__dirname, '../build', req.params.slug + '.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      const notFoundPath = path.join(__dirname, '../build/404.html');
      res.status(404).sendFile(notFoundPath, (err2) => {
        if (err2) {
          res.status(404).send('Page not found');
        }
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Default login: bogdan/bogdan`);
});

module.exports = app;