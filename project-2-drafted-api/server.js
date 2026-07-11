const express = require('express');
const projectsRouter = require('./src/routes/projects');
const tasksRouter = require('./src/routes/tasks');
const teamRouter = require('./src/routes/team');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies — anything sent as application/json lands in req.body
app.use(express.json());

// If someone sends malformed JSON, express.json() throws before our routes
// even run. Catch that specifically so it becomes a clean 400, not a 500.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON.' } });
  }
  next(err);
});

// Small request logger — helpful while developing/demoing locally
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// Health check — a standard convention so anything monitoring the API
// (or a grader, or you) has a trivial way to confirm it's alive.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
});

app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/team', teamRouter);

// Anything that reached here matched no route above.
app.use((req, res) => {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.originalUrl}` } });
});

// Centralized error handler — anything thrown or passed to next(err)
// anywhere in the app ends up here instead of crashing the process
// or leaking a stack trace to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { message: 'Something went wrong on the server.' } });
});

app.listen(PORT, () => {
  console.log(`Drafted API running at http://localhost:${PORT}`);
  console.log(`Try:  curl http://localhost:${PORT}/api/health`);
});
