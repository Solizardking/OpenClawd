DROP TABLE IF EXISTS comments;

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  post_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_comments_post_slug ON comments (post_slug);

-- Optional seed data:
-- INSERT INTO comments (author, body, post_slug) VALUES ('Kristian', 'Great post!', 'hello-world');
