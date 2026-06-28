-- Hero carousel slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  project_title TEXT,
  project_link TEXT,
  duration INTEGER DEFAULT 4,
  "order" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  year INTEGER,
  video_url TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Project images
CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_featured INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Team
CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT,
  photo_url TEXT,
  "order" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  project_name TEXT,
  quote TEXT NOT NULL,
  photo_url TEXT,
  "order" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- About (single row)
CREATE TABLE IF NOT EXISTS about (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  headline TEXT,
  description TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'published',
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Contact info (single row)
CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  phone TEXT,
  address TEXT,
  maps_link TEXT,
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  location TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Client admins (registered users)
CREATE TABLE IF NOT EXISTS client_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Drafts (pending approval)
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  reference_id INTEGER,
  data TEXT,
  submitted_by TEXT NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TEXT
);
