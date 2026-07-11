/**
 * Proves the DATABASE itself rejects bad data — not just the app's JS
 * validators. Runs against a throwaway in-memory copy of the schema, so it
 * never touches your real drafted.db. No server needs to be running.
 *
 *   npm run test:constraints
 */
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'src/db/schema.sql'), 'utf8'));

let passed = 0;
let failed = 0;

function expectThrow(label, fn) {
  try {
    fn();
    console.log(`  \u2717 ${label} (expected the database to reject this, but it didn't)`);
    failed++;
  } catch (err) {
    console.log(`  \u2713 ${label}`);
    passed++;
  }
}

function expectOk(label, fn) {
  try {
    fn();
    console.log(`  \u2713 ${label}`);
    passed++;
  } catch (err) {
    console.log(`  \u2717 ${label} -> unexpectedly threw: ${err.message}`);
    failed++;
  }
}

console.log('Testing schema constraints directly against SQLite (bypassing the API entirely)\n');

expectThrow('NOT NULL on projects.name rejects a missing name', () => {
  db.prepare(`INSERT INTO projects (client) VALUES ('Test Client')`).run();
});

expectThrow('CHECK on projects.status rejects an invalid status', () => {
  db.prepare(`INSERT INTO projects (name, client, status) VALUES ('X', 'Y', 'not-a-status')`).run();
});

expectThrow('CHECK on projects.progress rejects an out-of-range value', () => {
  db.prepare(`INSERT INTO projects (name, client, progress) VALUES ('X', 'Y', 150)`).run();
});

expectThrow('UNIQUE on team.name rejects a duplicate name', () => {
  db.prepare(`INSERT INTO team (name, role) VALUES ('Duplicate Person', 'Role A')`).run();
  db.prepare(`INSERT INTO team (name, role) VALUES ('Duplicate Person', 'Role B')`).run();
});

expectOk('A fully valid project insert still succeeds', () => {
  db.prepare(`INSERT INTO projects (name, client, status, progress) VALUES ('Valid', 'Client', 'on-track', 50)`).run();
});

console.log('\nForeign key + cascade behavior');
{
  const projectId = db.prepare(`INSERT INTO projects (name, client) VALUES ('Cascade Test', 'Client')`).run().lastInsertRowid;
  db.prepare(`INSERT INTO tasks (text, projectId) VALUES ('Task tied to project', ?)`).run(projectId);
  db.prepare(`DELETE FROM projects WHERE id = ?`).run(projectId);
  const orphaned = db.prepare(`SELECT * FROM tasks WHERE projectId = ?`).all(projectId);
  if (orphaned.length === 0) {
    console.log('  \u2713 ON DELETE CASCADE removed the task when its project was deleted');
    passed++;
  } else {
    console.log('  \u2717 ON DELETE CASCADE did not clean up the orphaned task');
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
