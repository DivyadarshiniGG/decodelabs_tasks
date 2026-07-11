/**
 * Smoke test — run this AFTER starting the server (`npm start`) in
 * another terminal. It hits every endpoint and checks the status code
 * and response shape, then prints a pass/fail summary.
 *
 * Usage:
 *   npm start          (in one terminal, leave it running)
 *   npm test           (in another terminal)
 */

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  \u2713 ${label}`);
    passed++;
  } else {
    console.log(`  \u2717 ${label}`);
    failed++;
  }
}

async function run() {
  console.log('Running Drafted API smoke test against', BASE, '\n');

  // --- Health check ---
  console.log('Health check');
  {
    const res = await fetch(`${BASE}/api/health`);
    const body = await res.json();
    check('GET /api/health -> 200', res.status === 200);
    check('response has status: "ok"', body.status === 'ok');
  }

  // --- Projects ---
  console.log('\nProjects');
  {
    const res = await fetch(`${BASE}/api/projects`);
    const body = await res.json();
    check('GET /api/projects -> 200', res.status === 200);
    check('returns an array with 5 seeded projects', Array.isArray(body) && body.length === 5);
  }
  {
    const res = await fetch(`${BASE}/api/projects/1`);
    check('GET /api/projects/1 -> 200', res.status === 200);
  }
  {
    const res = await fetch(`${BASE}/api/projects/999`);
    check('GET /api/projects/999 (missing) -> 404', res.status === 404);
  }
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', client: 'Test Client' }),
    });
    check('POST /api/projects with empty name -> 400', res.status === 400);
  }
  let createdProjectId;
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke Test Project', client: 'QA' }),
    });
    const body = await res.json();
    check('POST /api/projects valid -> 201', res.status === 201);
    check('response includes generated id', typeof body.id === 'number');
    createdProjectId = body.id;
  }
  {
    const res = await fetch(`${BASE}/api/projects/${createdProjectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: 50 }),
    });
    const body = await res.json();
    check('PATCH /api/projects/:id -> 200', res.status === 200);
    check('progress actually updated', body.progress === 50);
  }
  {
    const res = await fetch(`${BASE}/api/projects/${createdProjectId}`, { method: 'DELETE' });
    check('DELETE /api/projects/:id -> 204', res.status === 204);
  }
  {
    const res = await fetch(`${BASE}/api/projects?status=not-a-real-status`);
    check('GET /api/projects?status=invalid -> 400', res.status === 400);
  }

  // --- Tasks ---
  console.log('\nTasks');
  {
    const res = await fetch(`${BASE}/api/tasks`);
    const body = await res.json();
    check('GET /api/tasks -> 200', res.status === 200);
    check('returns an array', Array.isArray(body));
  }
  {
    const res = await fetch(`${BASE}/api/tasks?completed=true`);
    const body = await res.json();
    check('GET /api/tasks?completed=true -> 200', res.status === 200);
    check('every task returned is completed', body.every((t) => t.completed === true));
  }
  {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Smoke test task', projectId: 9999 }),
    });
    check('POST /api/tasks with bad projectId -> 400', res.status === 400);
  }
  {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Smoke test task' }),
    });
    check('POST /api/tasks valid -> 201', res.status === 201);
  }

  // --- Team ---
  console.log('\nTeam');
  {
    const res = await fetch(`${BASE}/api/team`);
    const body = await res.json();
    check('GET /api/team -> 200', res.status === 200);
    check('returns an array with 5 seeded members', Array.isArray(body) && body.length === 5);
  }

  // --- Unknown route ---
  console.log('\nUnknown route');
  {
    const res = await fetch(`${BASE}/api/not-a-real-endpoint`);
    check('GET /api/not-a-real-endpoint -> 404', res.status === 404);
  }

  // --- Nested resource ---
  console.log('\nNested resource');
  {
    const res = await fetch(`${BASE}/api/projects/4/tasks`);
    const body = await res.json();
    check('GET /api/projects/4/tasks -> 200', res.status === 200);
    check('every task belongs to project 4', body.every((t) => t.projectId === 4));
  }
  {
    const res = await fetch(`${BASE}/api/projects/999/tasks`);
    check('GET /api/projects/999/tasks (missing project) -> 404', res.status === 404);
  }

  // --- Malformed JSON ---
  console.log('\nMalformed request body');
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{this is not valid json',
    });
    check('POST with malformed JSON -> 400 (not 500)', res.status === 400);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\nCould not reach the server. Is it running? (npm start)\n');
  console.error(err.message);
  process.exit(1);
});
