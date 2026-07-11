const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../drafted.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const isNewDatabase = !fs.existsSync(DB_PATH);

const db = new DatabaseSync(DB_PATH);

// SQLite does NOT enforce foreign keys unless you turn this on explicitly.
// Without it, ON DELETE CASCADE in the schema would silently do nothing.
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

if (isNewDatabase) {
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  seed();
  console.log('New database created and seeded at', DB_PATH);
} else {
  console.log('Using existing database at', DB_PATH);
}

function seed() {
  const insertProject = db.prepare(
    `INSERT INTO projects (name, client, status, progress, dueDate) VALUES (?, ?, ?, ?, ?)`
  );
  [
    ['Riverside Loft Renovation', 'Eastvale Residential', 'on-track', 72, '2026-09-14'],
    ['Maple & Co. Office Fit-out', 'Maple & Co.', 'at-risk', 38, '2026-10-02'],
    ['Birchwood Residence', 'Private Client', 'ahead', 91, '2026-08-30'],
    ['Harbor View Pavilion', 'Harbor Trust', 'on-track', 55, '2026-11-20'],
    ['Kestrel Studio Extension', 'Kestrel Arts Collective', 'on-track', 20, '2026-12-05'],
  ].forEach((p) => insertProject.run(...p));

  const insertTask = db.prepare(`INSERT INTO tasks (text, completed, projectId) VALUES (?, ?, ?)`);
  [
    ['Confirm site visit time with Harbor Trust', 0, 4],
    ['Upload structural calcs for Birchwood', 1, 3],
    ["Chase Maple & Co. invoice #1042", 0, 2],
  ].forEach((t) => insertTask.run(...t));

  const insertMember = db.prepare(`INSERT INTO team (name, role, availability) VALUES (?, ?, ?)`);
  [
    ['Divya Darshini', 'Project Manager', 'available'],
    ['Elena Marsh', 'Lead Architect', 'available'],
    ['Jamie Okafor', 'Interior Design', 'busy'],
    ['Theo Suárez', 'Structural Engineer', 'available'],
    ['Nadia Petrov', 'Draftsperson', 'off'],
  ].forEach((m) => insertMember.run(...m));
}

module.exports = db;
