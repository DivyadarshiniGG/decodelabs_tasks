# Drafted DB — Project 3
**DecodeLabs Full Stack Internship — Project 3: Database Integration**

This upgrades the Project 2 API — same routes, same validation — but the in-memory
arrays are gone. Data now lives in a real SQL database file (`drafted.db`) and survives
server restarts.

## What's different from Project 2
- Real persistence via **SQLite**, using Node's **built-in `node:sqlite` module**
  (ships with Node 18.5+ — no `npm install` of a database driver, no native compilation
  to worry about, which is a common Windows pain point with packages like
  `better-sqlite3`). It's marked "experimental" by Node but is fully functional; see
  *Design decisions* below for the honest tradeoff.
- A real schema with `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, and `FOREIGN KEY`
  constraints — enforced by the database itself, not just app code.
- Every single query is **parameterized** (`?` placeholders) — never string
  concatenation — which is what actually prevents SQL injection.

## Prerequisites
**Node.js 22.5 or newer** (needed for `node:sqlite`). Check yours:
```bash
node --version
```

## Setup & running
```bash
npm install     # installs Express only — no database driver to compile
npm start       # creates drafted.db (if it doesn't exist yet), seeds it, starts the server
```
Leave that running. In a **second terminal**:
```bash
npm test                  # hits every endpoint against the live server (20 checks)
npm run test:constraints  # proves the DATABASE rejects bad data, bypassing the API (6 checks)
```

To wipe the database and start fresh:
```bash
npm run reset-db
```

## Proving it's really persistent (not just "looks like" Project 2)
This is the one thing that's actually new here, so it's worth seeing directly:
1. `npm start`
2. In another terminal: `curl -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -d '{"name":"Test","client":"Me"}'`
3. Go back to the server terminal, press **Ctrl+C** to kill it completely
4. Run `npm start` again — a brand new process, no memory of the old one
5. `curl http://localhost:3000/api/projects` — your "Test" project is still there

## Schema

```sql
projects (id, name, client, status, progress, dueDate)
tasks    (id, text, completed, projectId -> projects.id, ON DELETE CASCADE)
team     (id, name UNIQUE, role, availability)
```

One-to-many relationship: a project has many tasks. Deleting a project deletes its
tasks automatically (`ON DELETE CASCADE`) — no orphaned rows left behind.

Constraints enforced at the schema level:
- `NOT NULL` — `name`, `client`, `text`, etc. can't be empty
- `CHECK` — `status` must be one of 3 values; `progress` must be 0–100; `completed` must be 0 or 1
- `UNIQUE` — no two team members can share a name
- `FOREIGN KEY ... ON DELETE CASCADE` — referential integrity between tasks and projects

`npm run test:constraints` proves these work by inserting bad data **directly**,
skipping the API and its JS validation entirely — showing the database itself is the
final line of defense, not just the app.

## Endpoint reference
Same endpoints and status codes as Project 2 — full CRUD on `/api/projects` and
`/api/tasks`, read-only `/api/team`, plus `/api/health`. See the code comments in
`src/routes/*.js` for the exact behavior of each; the shapes are unchanged from
Project 2's README, just now backed by SQL instead of arrays.

```bash
curl http://localhost:3000/api/projects
curl "http://localhost:3000/api/projects?status=at-risk"
curl -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -d '{"name":"Lakeside Pavilion","client":"Lakeside Trust"}'
curl -X PATCH http://localhost:3000/api/projects/1 -H "Content-Type: application/json" -d '{"progress":80}'
curl -X DELETE http://localhost:3000/api/projects/1
curl http://localhost:3000/api/projects/1/tasks
curl "http://localhost:3000/api/tasks?completed=false"
curl http://localhost:3000/api/team
```

## Design decisions (and the honest tradeoffs)

**SQLite over Postgres/MySQL** — the brief asks for "a simple database," and SQLite is
a real SQL database (not a toy) that needs no separate server process to install and
keep running. Trade-off: SQLite isn't built for many concurrent writers, which is fine
here but would matter at real production scale — Postgres/MySQL are the natural next
step, not a different category of tool.

**`node:sqlite` over `better-sqlite3`** — both give the same SQL experience. This
project deliberately picked the one with zero native-compilation risk, since
`better-sqlite3` needs a C++ build step that can fail on Windows machines without
build tools installed — exactly the kind of setup friction that isn't worth it for this
milestone. The tradeoff being disclosed honestly: `node:sqlite` is labeled
"experimental" by Node itself (it still prints a warning on startup) — meaning its API
could change in a future Node version. For a real production system you'd pick
`better-sqlite3` or a hosted Postgres instance instead.

**Native driver, not an ORM** — raw parameterized SQL is used directly rather than
Prisma/Sequelize/Mongoose. This is slower to write than an ORM but makes it obvious
exactly what SQL is running — useful for a learning milestone, and it's what the deck
itself lists as one of two legitimate approaches, not the "wrong" one.

**Parameterized queries everywhere** — every query uses `?` placeholders with values
passed separately, never `+ userInput +` string concatenation. This is the actual fix
for SQL injection, not just a style preference:
```js
// Vulnerable (never do this):
db.exec(`SELECT * FROM projects WHERE id = ${req.params.id}`);

// What this project actually does:
db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
```

## Possible next steps
- Swap SQLite for Postgres/MySQL if this needed to handle real concurrent traffic
- Add authentication so writes require a logged-in user
- Wire the Project 1 frontend to actually call this API instead of hardcoded HTML
