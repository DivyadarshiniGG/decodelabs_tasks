# Drafted API
**DecodeLabs Full Stack Internship — Project 2: Backend API Development**

The backend that would power the "Drafted" studio dashboard from Project 1 — a REST API
for managing projects, tasks, and team members at Hollow & Finch Studio. Built with
Node.js and Express, in-memory data (no database — this project is explicitly the step
*before* that).

## Prerequisites
- **Node.js 18 or newer** (uses the built-in `fetch` in the test script). Check yours with:
  ```
  node --version
  ```
  If you don't have it, download from [nodejs.org](https://nodejs.org) (LTS version).

## Setup & running

```bash
npm install       # installs Express
npm start         # starts the server on http://localhost:3000
```

Leave that running, then in a **second terminal**, verify everything works:
```bash
npm test          # runs an automated smoke test against all endpoints
```
You should see `22 passed, 0 failed`.

## Project structure
```
server.js                  entry point — middleware, routing, error handling
src/data/store.js          in-memory "database" (arrays + seed data)
src/validation/validators.js  hand-written input validation
src/routes/projects.js     /api/projects endpoints
src/routes/tasks.js        /api/tasks endpoints
src/routes/team.js         /api/team endpoints
test-api.js                automated smoke test (run with `npm test`)
```

## Endpoint reference

All responses are JSON. All request bodies are JSON (`Content-Type: application/json`).

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Confirms the server is running |

```bash
curl http://localhost:3000/api/health
```

### Projects

| Method | Path | Description | Success | Failure |
|---|---|---|---|---|
| GET | `/api/projects` | List all projects. Optional `?status=on-track\|at-risk\|ahead` | 200 | 400 if status is invalid |
| GET | `/api/projects/:id` | Get one project | 200 | 404 if not found |
| GET | `/api/projects/:id/tasks` | Tasks belonging to that project | 200 | 404 if project not found |
| POST | `/api/projects` | Create a project | 201 | 400 if invalid |
| PATCH | `/api/projects/:id` | Update one or more fields | 200 | 404 / 400 |
| DELETE | `/api/projects/:id` | Delete a project | 204 | 404 |

**Fields:** `name` (string, required), `client` (string, required), `status` (one of
`on-track`/`at-risk`/`ahead`, defaults to `on-track`), `progress` (number 0–100, defaults
to 0), `dueDate` (date string, optional).

```bash
# List all
curl http://localhost:3000/api/projects

# Filter by status
curl "http://localhost:3000/api/projects?status=at-risk"

# Get one
curl http://localhost:3000/api/projects/1

# Create
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Lakeside Pavilion","client":"Lakeside Trust","progress":10}'

# Update (partial)
curl -X PATCH http://localhost:3000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"progress":80}'

# Delete
curl -X DELETE http://localhost:3000/api/projects/1

# Trigger a validation error, on purpose
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":""}'
```

### Tasks

| Method | Path | Description | Success | Failure |
|---|---|---|---|---|
| GET | `/api/tasks` | List all tasks. Optional `?completed=true\|false` | 200 | 400 if invalid |
| GET | `/api/tasks/:id` | Get one task | 200 | 404 |
| POST | `/api/tasks` | Create a task | 201 | 400 |
| PATCH | `/api/tasks/:id` | Update text / toggle completed | 200 | 404 / 400 |
| DELETE | `/api/tasks/:id` | Delete a task | 204 | 404 |

**Fields:** `text` (string, required), `completed` (boolean, defaults to `false`),
`projectId` (integer, optional — if provided, must match a real project; this is checked,
not just its type).

```bash
curl http://localhost:3000/api/tasks
curl "http://localhost:3000/api/tasks?completed=false"

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Send revised elevations","projectId":1}'

curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

curl -X DELETE http://localhost:3000/api/tasks/1
```

### Team

| Method | Path | Description | Success | Failure |
|---|---|---|---|---|
| GET | `/api/team` | List all members. Optional `?availability=available\|busy\|off` | 200 | — |
| GET | `/api/team/:id` | Get one member | 200 | 404 |

Read-only on purpose — the brief doesn't ask for team management, so there's no
POST/PATCH/DELETE here. Not every resource in a real API needs every method.

```bash
curl http://localhost:3000/api/team
curl "http://localhost:3000/api/team?availability=available"
```

## Design decisions (and how they map to the brief)

**REST-style naming** — resources are nouns (`/projects`, `/tasks`), never verbs
(`/getProjects`). The HTTP method carries the verb instead.

**Real status codes, not always 200** — `200` (read/update ok), `201` (created), `204`
(deleted, nothing to return), `400` (the client sent something invalid), `404` (resource
doesn't exist). A consistent error shape is used everywhere:
```json
{ "error": { "message": "...", "details": ["...", "..."] } }
```

**"Never trust the client"** — every POST/PATCH runs through hand-written validators
before touching the data store. This includes both *syntactic* checks (is `progress` a
number?) and *semantic* checks (does this `projectId` actually exist?) — the brief draws
that same distinction explicitly.

**Statelessness** — every request carries everything it needs (the URL, the body); the
server doesn't remember anything about "who asked last time." Each request stands alone.

**Centralized error handling** — a single Express error-handling middleware in
`server.js` catches anything unexpected so the server returns a clean `500` instead of
crashing or leaking a stack trace.

## Testing it against the Project 1 dashboard
The seed data intentionally matches Project 1's Hollow & Finch content (same project
names, same tasks) — this API is written to be the real backend for that dashboard. It's
not wired up yet (Project 1 still uses hardcoded HTML), but the shapes match, so
connecting them later is a fetch() call away, not a redesign.

## Possible next steps
- Persist data to a real database (this is explicitly the next milestone, not this one)
- Add authentication (`AuthN`/`AuthZ`) if the API needs to distinguish users
- Add rate limiting (429) if this were exposed publicly
- Wire the Project 1 frontend to actually call this API instead of using hardcoded data
