-- Cloudflare D1 (SQLite). Idempotent: `npm run db:migrate` çalıştırır.
-- users tablosuna eklenecek sütunlar script tarafından PRAGMA ile kontrol edilerek eklenir:
--   role TEXT DEFAULT 'admin', failed_attempts INTEGER DEFAULT 0, locked_until TEXT, last_login_at TEXT

CREATE TABLE IF NOT EXISTS seo_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL,            -- 'page' | 'portfolio'
  ref TEXT NOT NULL,              -- sayfa anahtarı veya kayıt id
  title TEXT, description TEXT, keywords TEXT, og_image TEXT, canonical TEXT,
  noindex INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT,
  UNIQUE(scope, ref)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL,
  ip TEXT, mail_sent INTEGER NOT NULL DEFAULT 0, createdAt TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, action TEXT NOT NULL, entity TEXT, entity_id TEXT, ip TEXT, createdAt TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0, createdAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_portfolios_url ON portfolios(url);
CREATE INDEX IF NOT EXISTS idx_portfolios_cat ON portfolios(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_pid ON portfolio_images(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(createdAt);
