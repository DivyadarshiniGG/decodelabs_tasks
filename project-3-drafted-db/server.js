const express = require('express');
require('./src/db/connection'); // opens/creates/seeds the SQLite file on startup
const projectsRouter = require('./src/routes/projects');
const tasksRouter = require('./src/routes/tasks');
const teamRouter = require('./src/routes/team');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON.' } });
  }
  next(err);
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
});

app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/team', teamRouter);

app.use((req, res) => {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.originalUrl}` } });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { message: 'Something went wrong on the server.' } });
});

app.listen(PORT, () => {
  console.log(`Drafted API (with database) running at http://localhost:${PORT}`);
  console.log(`Try:  curl http://localhost:${PORT}/api/health`);
});
