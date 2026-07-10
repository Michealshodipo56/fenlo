-- Run in Neon SQL Editor
CREATE TABLE IF NOT EXISTS submissions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  input_text  TEXT NOT NULL,
  output_text TEXT NOT NULL,
  mode        TEXT NOT NULL CHECK (mode IN ('full', 'direct')),
  file_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage (
  user_id  TEXT PRIMARY KEY,
  count    INTEGER DEFAULT 0,
  plan     TEXT DEFAULT 'free',
  reset_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
