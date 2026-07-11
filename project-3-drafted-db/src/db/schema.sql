-- Drafted database schema.
-- One-to-many relationship: a project has many tasks (tasks.projectId -> projects.id).
-- Constraints are enforced HERE, at the schema level — not just in the app's JS
-- validation — per the brief's "never trust application logic blindly" rule.

CREATE TABLE IF NOT EXISTS projects (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  client    TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'on-track'
              CHECK (status IN ('on-track', 'at-risk', 'ahead')),
  progress  INTEGER NOT NULL DEFAULT 0
              CHECK (progress BETWEEN 0 AND 100),
  dueDate   TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  text       TEXT NOT NULL,
  completed  INTEGER NOT NULL DEFAULT 0
               CHECK (completed IN (0, 1)),
  projectId  INTEGER
               REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL,
  availability  TEXT NOT NULL DEFAULT 'available'
                  CHECK (availability IN ('available', 'busy', 'off'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_projectId ON tasks(projectId);
