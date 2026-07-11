/**
 * Run AFTER starting the server (`npm start`) in another terminal.
 *   npm start   (leave running)
 *   npm test    (in a second terminal)
 */

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 ${label}`); failed++; }
}

async function run() {
  console.log('Running Drafted DB API smoke test against', BASE, '\n');

  console.log('Health check');
  {
    const res = await fetch(`${BASE}/api/health`);
    const body = await res.json();
    check('GET /api/health -> 200', res.status === 200);
    check('response has status: "ok"', body.status === 'ok');
  }

  console.log('\nProjects (seeded data)');
  {
    const res = await fetch(`${BASE}/api/projects`);
    const body = await res.json();
    check('GET /api/projects -> 200', res.status === 200);
    check('returns an array with 5 seeded projects', Array.isArray(body) && body.length === 5);
  }
  {
    const res = await fetch(`${BASE}/api/projects/999`);
    check('GET /api/projects/999 (missing) -> 404', res.status === 404);
  }
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', client: 'Test Client' }),
    });
    check('POST /api/projects with empty name -> 400', res.status === 400);
  }

  console.log('\nProjects (real persistence — this is the actual point of Project 3)');
  let createdProjectId;
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Persistence Check', client: 'QA' }),
    });
    const body = await res.json();
    check('POST /api/projects valid -> 201', res.status === 201);
    createdProjectId = body.id;
  }
  {
    // Re-fetch it as a brand new request, proving the row is really in the
    // database file, not sitting in some in-memory variable.
    const res = await fetch(`${BASE}/api/projects/${createdProjectId}`);
    const body = await res.json();
    check('freshly created project is independently re-readable', res.status === 200 && body.name === 'Persistence Check');
  }
  {
    const res = await fetch(`${BASE}/api/projects/${createdProjectId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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

  console.log('\nCascade delete (foreign key relationship)');
  {
    const createRes = await fetch(`${BASE}/api/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cascade Test Project', client: 'QA' }),
    });
    const project = await createRes.json();

    await fetch(`${BASE}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Task tied to the cascade test project', projectId: project.id }),
    });

    await fetch(`${BASE}/api/projects/${project.id}`, { method: 'DELETE' });

    const tasksRes = await fetch(`${BASE}/api/tasks`);
    const allTasks = await tasksRes.json();
    const orphaned = allTasks.filter((t) => t.projectId === project.id);
    check('deleting a project also removes its tasks (ON DELETE CASCADE)', orphaned.length === 0);
  }

  console.log('\nTasks');
  {
    const res = await fetch(`${BASE}/api/tasks?completed=true`);
    const body = await res.json();
    check('GET /api/tasks?completed=true -> 200', res.status === 200);
    check('every task returned is completed', body.every((t) => t.completed === 1));
  }
  {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Bad task', projectId: 9999 }),
    });
    check('POST /api/tasks with nonexistent projectId -> 400', res.status === 400);
  }

  console.log('\nTeam');
  {
    const res = await fetch(`${BASE}/api/team`);
    const body = await res.json();
    check('GET /api/team -> 200', res.status === 200);
    check('returns an array with 5 seeded members', Array.isArray(body) && body.length === 5);
  }

  console.log('\nUnknown route & malformed body');
  {
    const res = await fetch(`${BASE}/api/not-a-real-endpoint`);
    check('GET /api/not-a-real-endpoint -> 404', res.status === 404);
  }
  {
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{not valid json',
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
